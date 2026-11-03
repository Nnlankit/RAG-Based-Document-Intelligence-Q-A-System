import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import { documentService } from '../services/documentService';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatMessageList } from '../components/chat/ChatMessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { ChatMessage, SourceAttribution } from '../types/chat';
import { useChatSettings } from '../context/ChatSettingsContext';
import { useToast } from '../components/common/Toast';

export const ChatPage: React.FC = () => {
  const { conversationId: routeConversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { similarityThreshold, topK, scopeDocumentIds } = useChatSettings();
  const { error, success } = useToast();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    routeConversationId || null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Refs to avoid race conditions during streaming and route transitions
  const isSendingRef = useRef(false);
  const activeConvIdRef = useRef<string | null>(activeConversationId);
  activeConvIdRef.current = activeConversationId;
  const loadedConvIdRef = useRef<string | null>(null);

  // Fetch list of conversations for sidebar
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => chatService.listConversations(),
  });

  // Fetch documents for the scope selector
  const { data: docData } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.listDocuments(),
  });
  const documents = docData?.documents || [];

  // Sync route param with activeConversationId
  useEffect(() => {
    if (routeConversationId && routeConversationId !== activeConversationId) {
      setActiveConversationId(routeConversationId);
    }
  }, [routeConversationId, activeConversationId]);

  // Load conversation messages when activeConversationId changes
  useEffect(() => {
    // If we are actively sending/streaming in this conversation, skip reloading to protect optimistic UI
    if (isSendingRef.current && activeConversationId && activeConversationId === loadedConvIdRef.current) {
      return;
    }

    if (activeConversationId) {
      if (loadedConvIdRef.current === activeConversationId && messages.length > 0) {
        return;
      }
      loadedConvIdRef.current = activeConversationId;
      chatService
        .getConversation(activeConversationId)
        .then((conv) => {
          setMessages(conv.messages || []);
        })
        .catch((err) => {
          console.warn('Could not load conversation', err);
          setActiveConversationId(null);
          loadedConvIdRef.current = null;
          navigate('/chat');
        });
    } else {
      loadedConvIdRef.current = null;
      setMessages([]);
    }
  }, [activeConversationId, navigate]);

  const handleNewChat = () => {
    if (isSending) return;
    setActiveConversationId(null);
    loadedConvIdRef.current = null;
    setMessages([]);
    navigate('/chat');
  };

  const handleSelectConversation = (id: string) => {
    if (isSending) return;
    setActiveConversationId(id);
    navigate(`/chat/${id}`);
  };

  const handleRenameConversation = async (id: string, newTitle: string) => {
    try {
      await chatService.renameConversation(id, newTitle);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      success('Conversation Renamed', `Updated title to "${newTitle}".`);
    } catch (err: any) {
      error('Rename Failed', err.message || 'Could not rename conversation');
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await chatService.deleteConversation(id);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (activeConversationId === id) {
        handleNewChat();
      }
      success('Conversation Deleted', 'Chat history was removed.');
    } catch (err: any) {
      error('Delete Failed', err.message || 'Could not delete conversation');
    }
  };

  // Core execution engine for both new messages and retries
  const executeGeneration = useCallback(
    async (text: string, targetUserId?: string, targetAssistantId?: string) => {
      setIsSending(true);
      isSendingRef.current = true;

      let accumulatedContent = '';
      let accumulatedSources: SourceAttribution[] = [];
      let isAbstention = false;

      try {
        await chatService.sendMessageStream(
          {
            question: text,
            conversation_id: activeConvIdRef.current,
            document_ids: scopeDocumentIds.length > 0 ? scopeDocumentIds : undefined,
            similarity_threshold: similarityThreshold,
            top_k: topK,
          },
          // onToken
          (token) => {
            accumulatedContent += token;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === targetAssistantId
                  ? { ...m, content: accumulatedContent, status: 'pending' }
                  : m
              )
            );
          },
          // onSources
          (sources) => {
            accumulatedSources = sources;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === targetAssistantId ? { ...m, sources } : m
              )
            );
          },
          // onAbstention
          (abstentionText) => {
            isAbstention = true;
            accumulatedContent = abstentionText;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === targetAssistantId
                  ? { ...m, content: abstentionText, abstention: true }
                  : m
              )
            );
          },
          // onDone
          (doneData) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === targetAssistantId
                  ? {
                      ...m,
                      id: doneData.assistant_message_id || m.id,
                      content: doneData.full_answer || accumulatedContent,
                      status: 'completed',
                      generation_latency_ms: doneData.generation_latency_ms,
                      total_latency_ms: doneData.total_latency_ms,
                      metadata: doneData.metadata,
                      abstention: isAbstention,
                    }
                  : m
              )
            );
            refetchConversations();
            queryClient.invalidateQueries({ queryKey: ['analytics-stats'] });
          },
          // onConversation
          (newConvId, meta) => {
            loadedConvIdRef.current = newConvId;
            activeConvIdRef.current = newConvId;
            if (!activeConversationId) {
              setActiveConversationId(newConvId);
              navigate(`/chat/${newConvId}`, { replace: true });
              refetchConversations();
            }

            // Sync backend-assigned message ID and sequence
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id === targetUserId && meta?.user_message_id) {
                  return {
                    ...m,
                    id: meta.user_message_id,
                    conversation_id: newConvId,
                    message_sequence: meta.user_sequence ?? m.message_sequence,
                  };
                }
                if (m.id === targetAssistantId) {
                  return { ...m, conversation_id: newConvId };
                }
                return m;
              })
            );
          },
          // onTiming
          (timing) => {
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id === targetAssistantId) {
                  const curMeta = m.metadata || {};
                  return {
                    ...m,
                    metadata: {
                      ...curMeta,
                      frontend_ttft_ms: timing.frontend_ttft_ms,
                      frontend_stream_duration_ms: timing.total_stream_duration_ms,
                    },
                  };
                }
                return m;
              })
            );
          }
        );
      } catch (err: any) {
        console.warn('Streaming failed, trying non-streaming fallback', err);
        try {
          const response = await chatService.sendMessage({
            question: text,
            conversation_id: activeConvIdRef.current,
            document_ids: scopeDocumentIds.length > 0 ? scopeDocumentIds : null,
            similarity_threshold: similarityThreshold,
            top_k: topK,
          });

          if (!activeConversationId && response.conversation_id) {
            loadedConvIdRef.current = response.conversation_id;
            activeConvIdRef.current = response.conversation_id;
            setActiveConversationId(response.conversation_id);
            navigate(`/chat/${response.conversation_id}`, { replace: true });
            refetchConversations();
          }

          setMessages((prev) =>
            prev.map((m) =>
              m.id === targetAssistantId
                ? {
                    ...m,
                    content: response.answer,
                    sources: response.sources,
                    status: 'completed',
                    retrieval_latency_ms: response.retrieval_latency_ms,
                    generation_latency_ms: response.generation_latency_ms,
                    total_latency_ms: response.total_latency_ms,
                    abstention: response.abstention,
                    metadata: response.metadata,
                  }
                : m
            )
          );
          refetchConversations();
          queryClient.invalidateQueries({ queryKey: ['analytics-stats'] });
        } catch (fallbackErr: any) {
          // Mark assistant bubble as failed without removing user message
          setMessages((prev) =>
            prev.map((m) =>
              m.id === targetAssistantId
                ? {
                    ...m,
                    status: 'failed',
                    error:
                      fallbackErr.message ||
                      'AI service is taking longer than expected. Please click Retry.',
                  }
                : m
            )
          );
        }
      } finally {
        setIsSending(false);
        isSendingRef.current = false;
      }
    },
    [
      activeConversationId,
      navigate,
      queryClient,
      refetchConversations,
      scopeDocumentIds,
      similarityThreshold,
      topK,
    ]
  );

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    const userMessageId = 'user-' + Date.now();
    const assistantMessageId = 'asst-' + Date.now();
    const convIdAtStart = activeConversationId;

    // 1. Immediately render user question in separate bubble on right
    const userMsg: ChatMessage = {
      id: userMessageId,
      conversation_id: convIdAtStart || undefined,
      role: 'user',
      content: text.trim(),
      status: 'completed',
      created_at: new Date().toISOString(),
    };

    // 2. Immediately render separate assistant bubble below user question
    const initialAssistantMsg: ChatMessage = {
      id: assistantMessageId,
      conversation_id: convIdAtStart || undefined,
      role: 'assistant',
      content: '',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);

    // 3. Trigger generation streaming into the separate assistant bubble
    executeGeneration(text.trim(), userMessageId, assistantMessageId);
  };

  const handleRetry = (assistantId?: string) => {
    if (isSending || !assistantId) return;

    const asstIdx = messages.findIndex((m) => m.id === assistantId);
    if (asstIdx === -1) return;

    // Locate preceding user message
    let userQuestion = '';
    let userMessageId: string | undefined;
    for (let i = asstIdx - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        userQuestion = messages[i].content;
        userMessageId = messages[i].id;
        break;
      }
    }
    if (!userQuestion) return;

    // Reset failed assistant message to pending state without duplicating user message
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId
          ? { ...m, content: '', status: 'pending', error: undefined }
          : m
      )
    );

    executeGeneration(userQuestion, userMessageId, assistantId);
  };

  const handleRegenerate = () => {
    if (isSending) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (lastAssistant && lastAssistant.id) {
      handleRetry(lastAssistant.id);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Conversations Sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-transparent">
        <ChatMessageList
          messages={messages}
          isLoading={isSending}
          isStreaming={isSending}
          onSelectPrompt={(prompt) => handleSendMessage(prompt)}
          onRegenerate={handleRegenerate}
          onRetry={handleRetry}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isSending}
          documents={documents}
        />
      </div>
    </div>
  );
};
