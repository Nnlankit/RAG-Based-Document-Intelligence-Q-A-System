import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Cpu,
  Layers,
  Sparkles,
  Database,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { documentService } from '../../services/documentService';
import { useChatSettings } from '../../context/ChatSettingsContext';
import { useToast } from '../common/Toast';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];
const MAX_SIZE_MB = 50;

type UploadStage =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'chunking'
  | 'embedding'
  | 'completed'
  | 'error';

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setScopeDocumentIds } = useChatSettings();
  const { success, error: toastError, warning } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createdDocId, setCreatedDocId] = useState<string | null>(null);
  const [resultChunkCount, setResultChunkCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setIsDragging(false);
    setUploadPercent(0);
    setStage('idle');
    setErrorMessage(null);
    setCreatedDocId(null);
    setResultChunkCount(0);
  };

  const handleClose = () => {
    if (stage === 'uploading' || stage === 'embedding' || stage === 'chunking') {
      if (!window.confirm('Document processing is currently in progress. Cancel upload?')) {
        return;
      }
    }
    resetState();
    onClose();
  };

  const validateFile = (file: File): boolean => {
    const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      setErrorMessage(
        `Unsupported file type '${ext}'. Supported formats: PDF, DOCX, TXT, Markdown (.md).`
      );
      return false;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(
        `File size exceeds maximum limit of ${MAX_SIZE_MB}MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`
      );
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    setStage('uploading');
    setErrorMessage(null);
    setUploadPercent(0);

    try {
      const res = await documentService.uploadDocument(selectedFile, (percent) => {
        setUploadPercent(percent);
        if (percent >= 100) {
          setStage('extracting');
          setTimeout(() => setStage('chunking'), 800);
          setTimeout(() => setStage('embedding'), 1800);
        }
      });

      setStage('completed');
      setCreatedDocId(res.document_id);
      setResultChunkCount(res.chunk_count);
      success('Document Indexed', `${res.filename} was indexed with ${res.chunk_count} chunks.`);

      // Refresh documents and stats queries
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-stats'] });
    } catch (err: any) {
      const msg = err.message || 'Failed to process document';
      setErrorMessage(msg);
      setStage('error');
      if (msg.toLowerCase().includes('identical') || msg.toLowerCase().includes('duplicate')) {
        warning('Duplicate Document', msg);
      } else {
        toastError('Upload Failed', msg);
      }
    }
  };

  const handleChatWithNewDoc = () => {
    if (createdDocId) {
      setScopeDocumentIds([createdDocId]);
    }
    handleClose();
    navigate('/chat');
  };

  const pipelineSteps = [
    { id: 'uploading', label: 'File Upload & Verification', desc: 'Secure transfer to local document repository' },
    { id: 'extracting', label: 'Text & Layout Extraction', desc: 'Parsing structures, pages, and metadata' },
    { id: 'chunking', label: 'Semantic Chunking', desc: 'Splitting into dense context-aware chunks' },
    { id: 'embedding', label: 'Embedding Generation', desc: 'Encoding vectors with nomic-embed-text' },
    { id: 'completed', label: 'pgvector Indexing', desc: 'Indexed into Neon PostgreSQL vector database' },
  ];

  const getStepStatus = (stepId: string) => {
    const order = ['idle', 'uploading', 'extracting', 'chunking', 'embedding', 'completed'];
    const currentIdx = order.indexOf(stage);
    const stepIdx = order.indexOf(stepId);

    if (stage === 'completed') return 'done';
    if (stage === 'error') return stepIdx < currentIdx ? 'done' : 'error';
    if (stepIdx < currentIdx) return 'done';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload & Ingest Document"
      description="Extract text, generate semantic chunks, and build pgvector indices."
      size="lg"
    >
      <div className="space-y-5">
        {stage === 'idle' || stage === 'error' ? (
          <>
            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#5920B5] bg-[#F0EBFA] dark:bg-[#2A2047]'
                  : 'border-[#E8E1F2] dark:border-[#352B52] hover:border-[#8B5CF6] bg-[#FAF8FD] dark:bg-[#150F24] hover:bg-[#F3EEFB] dark:hover:bg-[#1E1733]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5920B5] to-[#8B5CF6] text-white flex items-center justify-center mb-3 shadow-purple">
                <UploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-[#17152B] dark:text-white">
                Drag & drop your document here, or <span className="text-[#5920B5] dark:text-[#A78BFA] underline">browse files</span>
              </p>
              <p className="text-xs text-[#77738A] dark:text-[#A39EB8] mt-1 font-medium">
                Supports PDF, DOCX, TXT, Markdown (Max 50MB)
              </p>
            </div>

            {/* Selected File Card */}
            {selectedFile && (
              <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-10 h-10 rounded-xl bg-[#F0EBFA] dark:bg-[#2A2047] flex items-center justify-center text-[#5920B5] dark:text-[#A78BFA] shrink-0 font-bold text-xs">
                    {selectedFile.name.split('.').pop()?.toUpperCase() || 'FILE'}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#17152B] dark:text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-[#77738A] dark:text-[#A39EB8]">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="p-1.5 text-[#77738A] hover:text-[#DC2626] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!selectedFile}
                onClick={handleStartUpload}
                leftIcon={<UploadCloud className="w-4 h-4" />}
              >
                Upload & Process
              </Button>
            </div>
          </>
        ) : stage !== 'completed' ? (
          /* Multi-step Processing Pipeline */
          <div className="py-4 space-y-6">
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-[#17152B] dark:text-white">
                Processing "{selectedFile?.name}"
              </h4>
              <p className="text-xs text-[#77738A] dark:text-[#A39EB8]">
                Running through local RAG pipeline and vector generation
              </p>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#5920B5] dark:text-[#A78BFA]">
                  {stage === 'uploading' ? `Uploading (${uploadPercent}%)` : 'Vectorizing & Indexing...'}
                </span>
                <span className="font-mono text-[#77738A]">
                  {stage === 'uploading' ? `${uploadPercent}%` : '85%'}
                </span>
              </div>
              <div className="w-full bg-[#E8E1F2] dark:bg-[#352B52] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#5920B5] to-[#8B5CF6] h-full rounded-full transition-all duration-300"
                  style={{
                    width: stage === 'uploading' ? `${uploadPercent}%` : '85%',
                  }}
                />
              </div>
            </div>

            {/* Step-by-step pipeline status list */}
            <div className="space-y-2 pt-2">
              {pipelineSteps.map((step) => {
                const status = getStepStatus(step.id);
                return (
                  <div
                    key={step.id}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs transition-colors ${
                      status === 'done'
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                        : status === 'active'
                        ? 'bg-[#F0EBFA] dark:bg-[#2A2047] border-[#8B5CF6] text-[#5920B5] dark:text-[#DDD6FE] font-bold'
                        : 'bg-[#FAF8FD] dark:bg-[#150F24] border-[#E8E1F2] dark:border-[#352B52] text-[#77738A] dark:text-[#A39EB8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {status === 'done' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : status === 'active' ? (
                        <Cpu className="w-4 h-4 text-[#5920B5] animate-spin shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold">{step.label}</p>
                        <p className="text-[11px] opacity-80 font-normal">{step.desc}</p>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-wider">
                      {status === 'done' ? 'Completed' : status === 'active' ? 'In Progress' : 'Queued'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Completed Success Screen */
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#DCFCE7] dark:bg-[#143E24] border border-[#BBF7D0] dark:border-[#1F5E36] flex items-center justify-center text-[#16A34A] shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base font-bold text-[#17152B] dark:text-white">
                Document Successfully Indexed!
              </h4>
              <p className="text-xs text-[#77738A] dark:text-[#A39EB8] mt-1 max-w-md mx-auto">
                "{selectedFile?.name}" was processed into{' '}
                <span className="font-bold text-[#5920B5] dark:text-[#A78BFA]">
                  {resultChunkCount} semantic chunks
                </span>{' '}
                and indexed in Neon pgvector. Ready for grounded Q&A!
              </p>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <Button variant="secondary" onClick={resetState}>
                Upload Another
              </Button>
              <Button
                variant="primary"
                onClick={handleChatWithNewDoc}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Ask AI About Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
