import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Settings,
  SlidersHorizontal,
  Sun,
  Moon,
  Laptop,
  Cpu,
  Database,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useChatSettings } from '../context/ChatSettingsContext';
import { healthService } from '../services/healthService';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const {
    similarityThreshold,
    setSimilarityThreshold,
    topK,
    setTopK,
  } = useChatSettings();

  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['system-health'],
    queryFn: healthService.checkHealth,
  });

  const handleResetSettings = () => {
    setSimilarityThreshold(0.35);
    setTopK(5);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#30261E] dark:text-[#F7F0E3]">
          Settings & Configuration
        </h1>
        <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-0.5 font-medium">
          Tune RAG retrieval sensitivity, adjust theme preferences, and inspect local AI engines
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <Card className="border border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22] shadow-card">
          <CardHeader>
            <h3 className="text-xs font-semibold text-[#30261E] dark:text-[#F7F0E3] uppercase tracking-wider">
              Appearance & Theme
            </h3>
            <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-0.5 font-medium">
              Choose how DocuMind AI appears on your device
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'System', icon: Laptop },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id as any)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all text-xs font-medium text-left ${
                      isSelected
                        ? 'border-[#8B6F52] bg-[#E1D2B8] dark:bg-[#4A3B2F] text-[#5A4634] dark:text-[#E8DCC8] ring-1 ring-[#8B6F52] font-semibold shadow-xs'
                        : 'border-[#D4C3A5] dark:border-[#524436] bg-[#EEE3D0]/60 dark:bg-[#2A221C]/60 text-[#5A4634] dark:text-[#DCC9AA] hover:bg-[#E5D6BD]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#8B6F52]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* RAG Retrieval Parameters */}
        <Card className="border border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22] shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-[#30261E] dark:text-[#F7F0E3] uppercase tracking-wider">
                RAG Retrieval & Evidence Threshold
              </h3>
              <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-0.5 font-medium">
                Calibrate evidence strictness to prevent hallucinated answers
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetSettings}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs text-[#5A4634] dark:text-[#E8DCC8] hover:bg-[#E1D2B8]/40"
            >
              Reset Defaults
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Similarity Threshold Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#30261E] dark:text-[#F7F0E3]">
                  Evidence Similarity Threshold
                </span>
                <span className="font-mono px-2 py-0.5 rounded bg-[#E1D2B8] dark:bg-[#4A3B2F] text-[#5A4634] dark:text-[#E8DCC8] font-bold border border-[#CDBB9D] dark:border-[#5A4634]">
                  {similarityThreshold}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#5A4634] cursor-pointer"
              />
              <p className="text-[11px] text-[#5A4634] dark:text-[#DCC9AA]">
                Default calibrated value is <span className="font-mono font-semibold">0.35</span>. Chunks with fused scores below this threshold are discarded. If no chunks exceed this score, the system strictly abstains to avoid hallucination.
              </p>
            </div>

            {/* Top-K Chunks Slider */}
            <div className="space-y-2 pt-2 border-t border-[#D4C3A5]/40 dark:border-[#524436]/40">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#30261E] dark:text-[#F7F0E3]">
                  Top-K Retrieved Chunks
                </span>
                <span className="font-mono px-2 py-0.5 rounded bg-[#E1D2B8] dark:bg-[#4A3B2F] text-[#5A4634] dark:text-[#E8DCC8] font-bold border border-[#CDBB9D] dark:border-[#5A4634]">
                  {topK}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value, 10))}
                className="w-full accent-[#5A4634] cursor-pointer"
              />
              <p className="text-[11px] text-[#5A4634] dark:text-[#DCC9AA]">
                Number of most relevant chunks passed to Llama 3.2 during prompt generation. Default is 5.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Engine & Environment Health */}
        <Card className="border border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22] shadow-card">
          <CardHeader>
            <h3 className="text-xs font-semibold text-[#30261E] dark:text-[#F7F0E3] uppercase tracking-wider">
              Connected Infrastructure & Models
            </h3>
            <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-0.5 font-medium">
              Local inference engines and persistence verification
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-[#D4C3A5] dark:border-[#524436] bg-[#EEE3D0]/60 dark:bg-[#2A221C]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-[#8B6F52]" />
                  <div>
                    <p className="font-semibold text-[#30261E] dark:text-[#F7F0E3]">Ollama LLM</p>
                    <p className="text-[11px] text-[#5A4634] dark:text-[#DCC9AA] font-mono font-medium">
                      {health?.details?.llm_model || 'llama3.2'}
                    </p>
                  </div>
                </div>
                <Badge variant={health?.models?.['llama3.2'] ? 'success' : 'danger'}>
                  {health?.models?.['llama3.2'] ? 'Ready' : 'Offline'}
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl border border-[#D4C3A5] dark:border-[#524436] bg-[#EEE3D0]/60 dark:bg-[#2A221C]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-[#8B6F52]" />
                  <div>
                    <p className="font-semibold text-[#30261E] dark:text-[#F7F0E3]">Embedding Model</p>
                    <p className="text-[11px] text-[#5A4634] dark:text-[#DCC9AA] font-mono font-medium">
                      {health?.details?.embedding_model || 'nomic-embed-text'}
                    </p>
                  </div>
                </div>
                <Badge variant={health?.models?.['nomic-embed-text'] ? 'success' : 'danger'}>
                  {health?.models?.['nomic-embed-text'] ? 'Ready' : 'Offline'}
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl border border-[#D4C3A5] dark:border-[#524436] bg-[#EEE3D0]/60 dark:bg-[#2A221C]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-[#657A58]" />
                  <div>
                    <p className="font-semibold text-[#30261E] dark:text-[#F7F0E3]">Vector Store</p>
                    <p className="text-[11px] text-[#5A4634] dark:text-[#DCC9AA] font-mono font-medium">
                      {health?.details?.vector_store_type?.toUpperCase() || 'CHROMADB'}
                    </p>
                  </div>
                </div>
                <Badge variant={health?.vector_store === 'healthy' ? 'success' : 'danger'}>
                  {health?.vector_store === 'healthy' ? 'Connected' : 'Error'}
                </Badge>
              </div>

              <div className="p-3.5 rounded-xl border border-[#D4C3A5] dark:border-[#524436] bg-[#EEE3D0]/60 dark:bg-[#2A221C]/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#8B6F52]" />
                  <div>
                    <p className="font-semibold text-[#30261E] dark:text-[#F7F0E3]">Relational DB</p>
                    <p className="text-[11px] text-[#5A4634] dark:text-[#DCC9AA] font-mono font-medium">SQLAlchemy Persistent</p>
                  </div>
                </div>
                <Badge variant={health?.database === 'healthy' ? 'success' : 'danger'}>
                  {health?.database === 'healthy' ? 'Active' : 'Error'}
                </Badge>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#EEE3D0]/70 dark:bg-[#2A221C]/70 border border-[#D4C3A5] dark:border-[#524436] text-xs space-y-1">
              <p className="font-semibold text-[#30261E] dark:text-[#F7F0E3] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#657A58]" />
                Air-Gapped & Privacy-Preserving
              </p>
              <p className="text-[#5A4634] dark:text-[#DCC9AA] text-[11px] leading-relaxed font-medium">
                All document text extraction, semantic chunking, dense vector embeddings, and LLM text generation occur entirely locally on your host machine. No user documents or prompts are transmitted to third-party cloud APIs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
