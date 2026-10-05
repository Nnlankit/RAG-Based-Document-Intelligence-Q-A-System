import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '../services/chatService';
import { documentService } from '../services/documentService';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatMessageList } from '../components/chat/ChatMessageList';
import { ChatInput } from '../components/chat/ChatInput';
import { ChatMessage, Conversation, SourceAttribution } from '../types/chat';
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

  // When route param changes or active ID changes, load conversation messages
  useEffect(() => {
    if (routeConversationId) {
      setActiveConversationId(routeConversationId);
    }
  }, [routeConversationId]);

  useEffect(() => {
    if (activeConversationId) {
      chatService
        .getConversation(activeConversationId)
        .then((conv) => {
          setMessages(conv.messages || []);
        })
        .catch((err) => {
          console.warn('Could not load conversation', err);
          setActiveConversationId(null);
          navigate('/chat');
        });
    } else {
      setMessages([]);
    }
  }, [activeConversationId, navigate]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    navigate('/chat');
  };

  const handleSelectConversation = (id: string) => {
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

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    // Optimistically append user message
    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);

    const streamMessageId = 'stream-' + Date.now();
    let accumulatedContent = '';
    let accumulatedSources: SourceAttribution[] = [];
    let isAbstention = false;

    try {
      await chatService.sendMessageStream(
        {
          question: text,
          conversation_id: activeConversationId,
          document_ids: scopeDocumentIds.length > 0 ? scopeDocumentIds : null,
          similarity_threshold: similarityThreshold,
          top_k: topK,
        },
        (token) => {
          accumulatedContent += token;
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === streamMessageId);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = {
                ...updated[idx],
                content: accumulatedContent,
              };
              return updated;
            } else {
              return [
                ...prev,
                {
                  id: streamMessageId,
                  role: 'assistant',
                  content: accumulatedContent,
                  sources: accumulatedSources,
                  created_at: new Date().toISOString(),
                },
              ];
            }
          });
        },
        (sources) => {
          accumulatedSources = sources;
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === streamMessageId);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], sources };
              return updated;
            }
            return prev;
          });
        },
        (abstentionText) => {
          isAbstention = true;
          accumulatedContent = abstentionText;
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === streamMessageId);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], content: abstentionText, abstention: true };
              return updated;
            } else {
              return [
                ...prev,
                {
                  id: streamMessageId,
                  role: 'assistant',
                  content: abstentionText,
                  abstention: true,
                  created_at: new Date().toISOString(),
                },
              ];
            }
          });
        },
        (doneData) => {
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === streamMessageId);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = {
                ...updated[idx],
                content: doneData.full_answer || accumulatedContent,
                generation_latency_ms: doneData.generation_latency_ms,
                total_latency_ms: doneData.total_latency_ms,
                metadata: doneData.metadata,
                abstention: isAbstention,
              };
              return updated;
            }
            return prev;
          });
          queryClient.invalidateQueries({ queryKey: ['analytics-stats'] });
        },
        (convId) => {
          if (!activeConversationId && convId) {
            setActiveConversationId(convId);
            navigate(`/chat/${convId}`, { replace: true });
            refetchConversations();
          }
        },
        (timing) => {
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === streamMessageId);
            if (idx >= 0) {
              const updated = [...prev];
              const curMeta = updated[idx].metadata || {};
              updated[idx] = {
                ...updated[idx],
                metadata: {
                  ...curMeta,
                  frontend_ttft_ms: timing.frontend_ttft_ms,
                  frontend_stream_duration_ms: timing.total_stream_duration_ms,
                },
              };
              return updated;
            }
            return prev;
          });
        }
      );
    } catch (err: any) {
      console.warn('Streaming failed, trying non-streaming fallback', err);
      try {
        const response = await chatService.sendMessage({
          question: text,
          conversation_id: activeConversationId,
          document_ids: scopeDocumentIds.length > 0 ? scopeDocumentIds : null,
          similarity_threshold: similarityThreshold,
          top_k: topK,
        });

        if (!activeConversationId && response.conversation_id) {
          setActiveConversationId(response.conversation_id);
          navigate(`/chat/${response.conversation_id}`, { replace: true });
          refetchConversations();
        }

        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== streamMessageId);
          return [
            ...filtered,
            {
              role: 'assistant',
              content: response.answer,
              sources: response.sources,
              retrieval_latency_ms: response.retrieval_latency_ms,
              generation_latency_ms: response.generation_latency_ms,
              total_latency_ms: response.total_latency_ms,
              abstention: response.abstention,
              metadata: response.metadata,
              created_at: new Date().toISOString(),
            },
          ];
        });
        queryClient.invalidateQueries({ queryKey: ['analytics-stats'] });
      } catch (fallbackErr: any) {
        error(
          'Query Failed',
          fallbackErr.message || 'AI service is taking longer than expected. Please try again.'
        );
      }
    } finally {
      setIsSending(false);
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
          onSelectPrompt={(prompt) => handleSendMessage(prompt)}
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
