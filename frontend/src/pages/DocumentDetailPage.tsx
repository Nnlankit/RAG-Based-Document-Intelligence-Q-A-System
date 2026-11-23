import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowLeft,
  Download,
  Trash2,
  Calendar,
  HardDrive,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  Send,
} from 'lucide-react';
import { documentService } from '../services/documentService';
import { chatService } from '../services/chatService';
import { DocumentViewer } from '../components/documents/DocumentViewer';
import { DocumentChunksViewer } from '../components/documents/DocumentChunksViewer';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { useToast } from '../components/common/Toast';
import { ChatMessage, SourceAttribution } from '../types/chat';
import { ChatMessageItem } from '../components/chat/ChatMessageItem';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const DocumentDetailPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'chat' | 'intelligence' | 'chunks'>('chat');
  const [targetPage, setTargetPage] = useState<number | null>(() => {
    const p = searchParams.get('page');
    return p ? parseInt(p, 10) : null;
  });

  // Local document chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Document metadata query
  const { data: document, isLoading: docLoading } = useQuery({
    queryKey: ['document', documentId],
    queryFn: () => documentService.getDocument(documentId!),
    enabled: !!documentId,
  });

  // Chunks query
  const { data: chunksData, isLoading: chunksLoading } = useQuery({
    queryKey: ['document-chunks', documentId],
    queryFn: () => documentService.getDocumentChunks(documentId!),
    enabled: !!documentId,
  });

  // Intelligence summaries query state
  const [summaryType, setSummaryType] = useState<'short' | 'detailed' | 'key_points'>('short');
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [extractedInfo, setExtractedInfo] = useState<any | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isGenQuestions, setIsGenQuestions] = useState(false);

  if (docLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[80vh]">
          <Skeleton className="h-full rounded-2xl" />
          <Skeleton className="h-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-12 text-center space-y-4">
        <FileText className="w-12 h-12 text-[#202124] dark:text-[#FFE89A] mx-auto opacity-60" />
        <h3 className="text-base font-bold text-[#202124] dark:text-white">Document Not Found</h3>
        <p className="text-xs text-[#77738A] dark:text-[#A8A499]">
          The requested document could not be located in the local repository.
        </p>
        <Button variant="primary" onClick={() => navigate('/documents')}>
          Back to Documents
        </Button>
      </div>
    );
  }

  // Handle Ask AI submit within document workspace
  const handleSendDocQuestion = async (textToSend?: string) => {
    const q = textToSend || inputText;
    if (!q.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: q.trim(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsChatLoading(true);

    try {
      const response = await chatService.sendMessage({
        question: q.trim(),
        conversation_id: conversationId,
        document_ids: [document.id], // lock to this document
      });

      setConversationId(response.conversation_id);
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        retrieval_latency_ms: response.retrieval_latency_ms,
        generation_latency_ms: response.generation_latency_ms,
        total_latency_ms: response.total_latency_ms,
        abstention: response.abstention,
      };
      setChatMessages((prev) => [...prev, assistantMsg]);

      // If source with page number returned, jump to page in viewer
      if (response.sources?.length && response.sources[0].page_number) {
        setTargetPage(response.sources[0].page_number);
      }
    } catch (err: any) {
      error('Question Failed', err.message || 'Failed to get answer');
    } finally {
      setIsChatLoading(false);
    }
  };

  // Summarize handler
  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const res = await documentService.summarize(document.id, summaryType);
      setSummaryResult(res.summary);
      success('Summary Generated', 'Document summary generated successfully.');
    } catch (err: any) {
      error('Summary Failed', err.message || 'Failed to generate summary');
    } finally {
      setIsSummarizing(false);
    }
  };

  // Extract Info handler
  const handleExtractInfo = async () => {
    setIsExtracting(true);
    try {
      const res = await documentService.extractInfo(document.id);
      setExtractedInfo(res);
      success('Metadata Extracted', 'Extracted structured insights.');
    } catch (err: any) {
      error('Extraction Failed', err.message || 'Failed to extract metadata');
    } finally {
      setIsExtracting(false);
    }
  };

  // Generate Questions handler
  const handleGenerateQuestions = async () => {
    setIsGenQuestions(true);
    try {
      const res = await documentService.generateQuestions(document.id, 8);
      setGeneratedQuestions(res.questions);
      success('Questions Ready', 'Generated 8 answerable questions.');
    } catch (err: any) {
      error('Generation Failed', err.message || 'Failed to generate questions');
    } finally {
      setIsGenQuestions(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete document "${document.filename}"?`)) return;
    try {
      await documentService.deleteDocument(document.id);
      success('Document Deleted', `"${document.filename}" was deleted.`);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      navigate('/documents');
    } catch (err: any) {
      error('Delete Failed', err.message || 'Failed to delete');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Workspace Header */}
      <div className="h-14 px-4 md:px-6 border-b border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5]/90 dark:bg-[#202124]/90 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/documents')}
            title="Back to documents"
            className="h-8 w-8 text-[#77746B] hover:text-[#202124]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2.5 truncate">
            <h2 className="text-sm font-bold text-[#202124] dark:text-white truncate max-w-sm">
              {document.filename}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold text-[#202124] dark:text-[#FFE89A] bg-[#FFF9E8] dark:bg-[#303238] border border-[#E9E1CC] dark:border-[#484A50]">
              {document.chunk_count} chunks
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => documentService.downloadDocument(document.id, document.original_filename)}
            leftIcon={<Download className="w-3.5 h-3.5" />}
            title="Download original file"
          >
            Download
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            title="Delete Document"
            className="h-8 w-8 text-[#77746B] hover:text-[#C94B4B] hover:bg-[#FCE8E8] dark:hover:bg-[#3D1414]"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Split Screen Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left 7 cols: Document Viewer */}
        <div className="lg:col-span-7 h-full p-4 overflow-hidden border-r border-[#E9E1CC] dark:border-[#303238]">
          <DocumentViewer document={document} targetPage={targetPage} />
        </div>

        {/* Right 5 cols: AI Contextual Assistant & Tabs */}
        <div className="lg:col-span-5 h-full flex flex-col min-h-0 bg-[#FFF9E8] dark:bg-[#1A1A1C] overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-[#E9E1CC] dark:border-[#303238] px-4 pt-2 gap-2 bg-white dark:bg-[#202124] shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-[#202124] text-[#202124] dark:border-[#FFE89A] dark:text-[#FFE89A]'
                  : 'border-transparent text-[#77746B] hover:text-[#202124] dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ask AI
            </button>
            <button
              onClick={() => setActiveTab('intelligence')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'intelligence'
                  ? 'border-[#202124] text-[#202124] dark:border-[#FFE89A] dark:text-[#FFE89A]'
                  : 'border-transparent text-[#77746B] hover:text-[#202124] dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence & Summary
            </button>
            <button
              onClick={() => setActiveTab('chunks')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'chunks'
                  ? 'border-[#202124] text-[#202124] dark:border-[#FFE89A] dark:text-[#FFE89A]'
                  : 'border-transparent text-[#77746B] hover:text-[#202124] dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Chunks ({chunksData?.total_chunks || document.chunk_count})
            </button>
          </div>

          {/* Tab 1: Contextual Q&A */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#77738A] dark:text-[#A8A499] space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#202124] text-[#FFE89A] border border-[#303238] flex items-center justify-center mx-auto shadow-subtle">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-[#202124] dark:text-white text-sm">
                      Contextual AI Document Assistant
                    </p>
                    <p className="max-w-xs mx-auto text-[#77738A] leading-relaxed">
                      Ask questions specifically grounded in "{document.filename}". Responses cite exact pages and chunks.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <ChatMessageItem key={i} message={msg} />
                  ))
                )}

                {isChatLoading && (
                  <div className="flex items-center gap-2 text-xs text-[#4D9B45] font-semibold">
                    <span className="w-2 h-2 rounded-full bg-[#4D9B45] animate-ping" />
                    <span>Analyzing document & generating answer...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Ask anything about ${document.filename}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendDocQuestion();
                    }}
                    disabled={isChatLoading}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFF9E8] dark:bg-[#1A1A1C] text-[#202124] dark:text-[#FFFDF5] placeholder-[#77738A]/70 focus:outline-none focus:ring-2 focus:ring-[#FFE89A]"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={!inputText.trim() || isChatLoading}
                    isLoading={isChatLoading}
                    onClick={() => handleSendDocQuestion()}
                    className="rounded-xl h-8 px-3"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Document Intelligence & Summary */}
          {activeTab === 'intelligence' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
              {/* Summary Section */}
              <div className="space-y-3 p-4 rounded-2xl border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#202124] dark:text-white flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#4D9B45]" />
                    Document Summarizer
                  </h4>
                  <div className="flex items-center gap-1 bg-[#FFFDF5] dark:bg-[#1A1A1C] p-1 rounded-xl border border-[#E9E1CC] dark:border-[#303238]">
                    {(['short', 'detailed', 'key_points'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setSummaryType(t)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
                          summaryType === t
                            ? 'bg-[#202124] text-[#FFE89A] shadow-subtle'
                            : 'text-[#77738A] hover:text-[#202124]'
                        }`}
                      >
                        {t === 'key_points' ? 'Key Points' : t}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  isLoading={isSummarizing}
                  onClick={handleSummarize}
                  className="w-full"
                >
                  Generate {summaryType.toUpperCase()} Summary
                </Button>

                {summaryResult && (
                  <div className="p-3.5 bg-[#FFF9E8] dark:bg-[#1A1A1C] rounded-xl border border-[#E9E1CC] dark:border-[#303238] leading-relaxed text-[#202124] dark:text-[#FFFDF5]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summaryResult}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Extract Metadata & Entities */}
              <div className="space-y-3 p-4 rounded-2xl border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#202124] dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#E8BD42]" />
                    Extract Entities & Metadata
                  </h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={isExtracting}
                    onClick={handleExtractInfo}
                  >
                    Extract
                  </Button>
                </div>

                {extractedInfo && (
                  <div className="p-3.5 bg-[#FFF9E8] dark:bg-[#1A1A1C] rounded-xl border border-[#E9E1CC] dark:border-[#303238] space-y-2">
                    {extractedInfo.author && (
                      <p>
                        <span className="font-bold text-[#202124] dark:text-white">Author:</span>{' '}
                        {extractedInfo.author}
                      </p>
                    )}
                    {extractedInfo.organization && (
                      <p>
                        <span className="font-bold text-[#202124] dark:text-white">Org:</span>{' '}
                        {extractedInfo.organization}
                      </p>
                    )}
                    {extractedInfo.technologies?.length > 0 && (
                      <div>
                        <span className="font-bold text-[#202124] dark:text-white block mb-1">
                          Technologies:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {extractedInfo.technologies.map((t: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E5F4DC] text-[#245B32] border border-[#DDF2C1]">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Generate Questions */}
              <div className="space-y-3 p-4 rounded-2xl border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#202124] dark:text-white flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#4D9B45]" />
                    Generated Questions
                  </h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    isLoading={isGenQuestions}
                    onClick={handleGenerateQuestions}
                  >
                    Generate
                  </Button>
                </div>

                {generatedQuestions.length > 0 && (
                  <div className="space-y-1.5">
                    {generatedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setActiveTab('chat');
                          handleSendDocQuestion(q);
                        }}
                        className="w-full text-left p-2.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFF9E8] dark:bg-[#1A1A1C] hover:border-[#E8BD42] hover:text-[#245B32] transition-colors font-medium"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Chunks Inspector */}
          {activeTab === 'chunks' && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <DocumentChunksViewer
                chunks={chunksData?.chunks || []}
                onSelectChunk={(c) => {
                  if (c.page_number) setTargetPage(c.page_number);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
