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
        <FileText className="w-12 h-12 text-[#8B6F52] dark:text-[#CDB795] mx-auto" />
        <h3 className="text-base font-semibold text-[#30261E] dark:text-[#F4EBDD]">Document Not Found</h3>
        <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] font-medium">
          The requested document could not be located on the server.
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
      <div className="h-14 px-6 border-b border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3]/90 dark:bg-[#261F1A]/90 backdrop-blur-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/documents')}
            title="Back to documents"
            className="h-8 w-8 text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] dark:hover:text-[#F4EBDD] hover:bg-[#E1D2B8]/40"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-2 truncate">
            <h2 className="text-sm font-bold text-[#30261E] dark:text-[#F7F0E3] truncate max-w-sm">
              {document.filename}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold text-[#5A4634] dark:text-[#E8DCC8] bg-[#E1D2B8] dark:bg-[#3E3228] border border-[#CDBB9D] dark:border-[#5A4634]">
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
            className="h-8 w-8 text-[#6B5C4D] dark:text-[#A89A89] hover:text-[#A65D50] hover:bg-[#A65D50]/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Split Screen Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
        {/* Left 6 or 7 cols: Document Viewer */}
        <div className="lg:col-span-7 h-full p-4 overflow-hidden border-r border-[#D4C3A5] dark:border-[#524436]">
          <DocumentViewer document={document} targetPage={targetPage} />
        </div>

        {/* Right 5 cols: AI Contextual Assistant & Tabs */}
        <div className="lg:col-span-5 h-full flex flex-col min-h-0 bg-[#F7F0E3]/40 dark:bg-[#261F1A]/40 overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-[#D4C3A5] dark:border-[#524436] px-4 pt-2 gap-2 bg-[#EEE3D0] dark:bg-[#2A221C] shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-[#5A4634] text-[#5A4634] dark:border-[#E8DCC8] dark:text-[#E8DCC8]'
                  : 'border-transparent text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] dark:hover:text-[#F7F0E3]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Ask AI
            </button>
            <button
              onClick={() => setActiveTab('intelligence')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'intelligence'
                  ? 'border-[#5A4634] text-[#5A4634] dark:border-[#E8DCC8] dark:text-[#E8DCC8]'
                  : 'border-transparent text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] dark:hover:text-[#F7F0E3]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Intelligence & Summary
            </button>
            <button
              onClick={() => setActiveTab('chunks')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'chunks'
                  ? 'border-[#5A4634] text-[#5A4634] dark:border-[#E8DCC8] dark:text-[#E8DCC8]'
                  : 'border-transparent text-[#5A4634] hover:text-[#211B16] dark:text-[#DCC9AA] dark:hover:text-[#F7F0E3]'
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
                  <div className="py-12 text-center text-xs text-[#5A4634] dark:text-[#DCC9AA] space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5A4634] text-[#F7F0E3] flex items-center justify-center mx-auto shadow-xs">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <p className="font-semibold text-[#30261E] dark:text-[#F7F0E3]">
                      Contextual AI Document Assistant
                    </p>
                    <p className="max-w-xs mx-auto text-[#5A4634] dark:text-[#DCC9AA]">
                      Ask questions specifically about "{document.filename}". Responses cite exact pages and chunks.
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <ChatMessageItem key={i} message={msg} />
                  ))
                )}

                {isChatLoading && (
                  <div className="flex items-center gap-2 text-xs text-[#5A4634] dark:text-[#DCC9AA] font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#8B6F52] animate-ping" />
                    <span>Analyzing document & generating answer...</span>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-[#D4C3A5] dark:border-[#524436] bg-[#EEE3D0]/70 dark:bg-[#2A221C]/70">
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
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[#CDBB9D] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22] text-[#30261E] dark:text-[#F7F0E3] placeholder-[#6B5C4D]/80 dark:placeholder-[#B9A995]/80 focus:outline-none focus:ring-1 focus:ring-[#8B6F52]"
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
            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
              {/* Summary Section */}
              <div className="space-y-3 p-4 rounded-xl border border-[#D4C3A5] dark:border-[#524436] bg-[#EEE3D0]/40 dark:bg-[#342A22]/40">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#30261E] dark:text-[#F7F0E3] flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-[#8B6F52]" />
                    Document Summarizer
                  </h4>
                  <div className="flex items-center gap-1">
                    {(['short', 'detailed', 'key_points'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setSummaryType(t)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          summaryType === t
                            ? 'bg-[#5A4634] text-[#F7F0E3]'
                            : 'bg-[#E1D2B8] text-[#5A4634] dark:bg-[#3E3228] dark:text-[#E8DCC8]'
                        }`}
                      >
                        {t === 'key_points' ? 'Key Points' : t.charAt(0).toUpperCase() + t.slice(1)}
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
                  <div className="p-3 bg-[#F7F0E3] dark:bg-[#2A221C] rounded-xl border border-[#D4C3A5] dark:border-[#524436] leading-relaxed text-[#30261E] dark:text-[#E8DCC8]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {summaryResult}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Extract Metadata & Entities */}
              <div className="space-y-3 p-4 rounded-xl border border-[#D4C3A5] dark:border-[#524436] bg-[#EEE3D0]/40 dark:bg-[#342A22]/40">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#30261E] dark:text-[#F7F0E3] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#8B6F52]" />
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
                  <div className="p-3 bg-[#F7F0E3] dark:bg-[#2A221C] rounded-xl border border-[#D4C3A5] dark:border-[#524436] space-y-2">
                    {extractedInfo.author && (
                      <p>
                        <span className="font-semibold text-[#30261E] dark:text-[#F7F0E3]">Author:</span>{' '}
                        {extractedInfo.author}
                      </p>
                    )}
                    {extractedInfo.organization && (
                      <p>
                        <span className="font-semibold text-[#30261E] dark:text-[#F7F0E3]">Org:</span>{' '}
                        {extractedInfo.organization}
                      </p>
                    )}
                    {extractedInfo.technologies?.length > 0 && (
                      <div>
                        <span className="font-semibold text-[#30261E] dark:text-[#F7F0E3] block mb-1">
                          Technologies:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {extractedInfo.technologies.map((t: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#E1D2B8] text-[#5A4634] dark:bg-[#3E3228] dark:text-[#E8DCC8] border border-[#CDBB9D] dark:border-[#5A4634]">
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
              <div className="space-y-3 p-4 rounded-xl border border-[#D4C3A5] dark:border-[#524436] bg-[#EEE3D0]/40 dark:bg-[#342A22]/40">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#30261E] dark:text-[#F7F0E3] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#657A58]" />
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
                        className="w-full text-left p-2.5 rounded-lg border border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#2A221C] hover:border-[#8B6F52] hover:text-[#5A4634] dark:hover:text-[#F7F0E3] transition-colors"
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
