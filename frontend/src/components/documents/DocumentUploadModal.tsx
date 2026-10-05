import React, { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  Cpu,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { documentService } from '../../services/documentService';
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
  const queryClient = useQueryClient();
  const { success, error: toastError, warning } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultChunkCount, setResultChunkCount] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setIsDragging(false);
    setUploadPercent(0);
    setStage('idle');
    setErrorMessage(null);
    setResultChunkCount(0);
  };

  const handleClose = () => {
    if (stage === 'uploading' || stage === 'embedding') {
      if (!window.confirm('Upload and ingestion is in progress. Are you sure you want to cancel?')) {
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
        `Unsupported format '${ext}'. Please upload a PDF, DOCX, TXT, or MD file.`
      );
      return false;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setErrorMessage(
        `File size exceeds ${MAX_SIZE_MB}MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`
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
      // Stage 1: Uploading
      const res = await documentService.uploadDocument(selectedFile, (percent) => {
        setUploadPercent(percent);
        if (percent >= 100) {
          setStage('embedding');
        }
      });

      setStage('completed');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload & Index Document"
      description="Select or drop documents for text extraction, chunking, and local vector indexing."
      size="md"
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
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#8B6F52] bg-[#EDE1CD] dark:bg-[#3E3228]'
                  : 'border-[#B9A587] dark:border-[#6B5A49] hover:border-[#8B6F52] bg-upload-gradient dark:bg-upload-dark-gradient hover:bg-[#EDE1CD] dark:hover:bg-[#3D3128]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-[#E1D2B8] dark:bg-[#4A3B2F] text-[#8B6F52] dark:text-[#E8DCC8] flex items-center justify-center mb-3 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-[#30261E] dark:text-[#F7F0E3]">
                Click to browse or drag & drop document
              </p>
              <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-1 font-medium">
                Supports PDF, DOCX, TXT, MD (Max 50MB)
              </p>
            </div>

            {/* Selected File Card */}
            {selectedFile && (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22]">
                <div className="flex items-center gap-3 truncate">
                  <div className="w-9 h-9 rounded-lg bg-[#E1D2B8] dark:bg-[#4A3B2F] flex items-center justify-center text-[#8B6F52] dark:text-[#E8DCC8] shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-[#30261E] dark:text-[#F7F0E3] truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-[#5A4634] dark:text-[#DCC9AA] font-medium">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="p-1 text-[#6B5C4D] hover:text-[#A65D50] rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-[#A65D50]/10 border border-[#A65D50]/30 flex items-start gap-2.5 text-[#A65D50] text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!selectedFile}
                onClick={handleStartUpload}
              >
                Upload & Process
              </Button>
            </div>
          </>
        ) : stage === 'uploading' || stage === 'embedding' ? (
          /* Processing Pipeline State */
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="relative w-16 h-16 rounded-2xl bg-[#E1D2B8] dark:bg-[#3E3228] flex items-center justify-center text-[#5A4634] dark:text-[#E8DCC8]">
              <Cpu className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#30261E] dark:text-[#F7F0E3]">
                {stage === 'uploading'
                  ? 'Uploading & Transmitting...'
                  : 'Chunking & Generating Embeddings...'}
              </h4>
              <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-1 max-w-sm">
                {stage === 'uploading'
                  ? `Uploaded ${uploadPercent}% to backend storage.`
                  : 'Document text is being extracted, semantically split, and embedded with nomic-embed-text.'}
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-[#E1D2B8] dark:bg-[#3E3228] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#5A4634] dark:bg-[#B87952] h-full rounded-full transition-all duration-300"
                style={{
                  width: stage === 'uploading' ? `${uploadPercent}%` : '85%',
                }}
              />
            </div>
          </div>
        ) : (
          /* Completed Success State */
          <div className="py-6 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#657A58]/15 border border-[#657A58]/30 flex items-center justify-center text-[#657A58]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#30261E] dark:text-[#F7F0E3]">
                Document Ingestion Complete!
              </h4>
              <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-1">
                Successfully processed into{' '}
                <span className="font-semibold text-[#5A4634] dark:text-[#DCC9AA]">
                  {resultChunkCount} semantic chunks
                </span>{' '}
                and indexed into the vector store.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4">
              <Button variant="secondary" onClick={resetState}>
                Upload Another
              </Button>
              <Button variant="primary" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
