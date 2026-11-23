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
  Sparkles,
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

  const { data: health, isLoading: healthLoading, refetch } = useQuery({
    queryKey: ['system-health'],
    queryFn: healthService.checkHealth,
  });

  const handleResetSettings = () => {
    setSimilarityThreshold(0.35);
    setTopK(5);
  };

  const isHealthy = health?.status === 'healthy';

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#202124] dark:text-white flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#202124] dark:text-[#FFE89A]" />
          <span>Settings & Configuration</span>
        </h1>
        <p className="text-xs text-[#77738A] dark:text-[#A8A499] mt-1 font-medium">
          Tune RAG retrieval sensitivity, adjust theme preferences, and inspect local AI engines
        </p>
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <Card className="border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card">
          <CardHeader>
            <h3 className="text-xs font-bold text-[#202124] dark:text-white uppercase tracking-wider">
              Appearance & Theme
            </h3>
            <p className="text-xs text-[#77738A] dark:text-[#A8A499] mt-0.5">
              Choose how DocuMind AI appears on your device
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Light Theme', desc: 'Warm cream & light yellow', icon: Sun },
                { id: 'dark', label: 'Dark Theme', desc: 'Deep charcoal contrast', icon: Moon },
                { id: 'system', label: 'System Default', desc: 'Sync with OS preference', icon: Laptop },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTheme(item.id as any)}
                    className={`flex items-start gap-3 p-4 rounded-2xl border transition-all text-xs text-left ${
                      isSelected
                        ? 'border-[#202124] bg-[#FFF9E8] dark:bg-[#303238] text-[#202124] dark:text-white ring-2 ring-[#202124] font-bold shadow-subtle'
                        : 'border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#1A1A1C] text-[#77746B] dark:text-[#A8A499] hover:bg-[#FFF9E8]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-[#202124] text-[#FFE89A]' : 'bg-white dark:bg-[#202124] text-[#77746B]'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[#202124] dark:text-white">{item.label}</p>
                      <p className="text-[11px] text-[#77738A] dark:text-[#A8A499] mt-0.5">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* RAG Retrieval Parameters */}
        <Card className="border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#202124] dark:text-white uppercase tracking-wider">
                RAG Retrieval & Evidence Threshold
              </h3>
              <p className="text-xs text-[#77738A] dark:text-[#A8A499] mt-0.5">
                Control vector grounding strictness, cosine similarity cutoff, and chunk retrieval count
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetSettings}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs text-[#77738A] hover:text-[#202124]"
            >
              Reset Defaults
            </Button>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Similarity Threshold Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-[#202124] dark:text-white">
                    Cosine Similarity Threshold
                  </label>
                  <p className="text-[11px] text-[#77738A] dark:text-[#A8A499]">
                    Chunks with a distance higher than this are dropped to prevent hallucinated answers.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-[#FFF9E8] dark:bg-[#303238] text-[#202124] dark:text-[#FFE89A] font-mono font-bold text-xs border border-[#E9E1CC] dark:border-[#484A50]">
                  {similarityThreshold}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.05"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#202124] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#77738A]">
                <span>0.1 (Strict Abstention)</span>
                <span>0.35 (Recommended Grounded)</span>
                <span>0.9 (Permissive Recall)</span>
              </div>
            </div>

            {/* Top-K Chunks Slider */}
            <div className="space-y-2 pt-2 border-t border-[#E9E1CC] dark:border-[#303238]">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-[#202124] dark:text-white">
                    Top-K Context Chunks
                  </label>
                  <p className="text-[11px] text-[#77738A] dark:text-[#A8A499]">
                    Number of most relevant semantic chunks supplied to Llama 3.2 synthesis prompt.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl bg-[#FFF9E8] dark:bg-[#303238] text-[#202124] dark:text-[#FFE89A] font-mono font-bold text-xs border border-[#E9E1CC] dark:border-[#484A50]">
                  {topK} chunks
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value, 10))}
                className="w-full accent-[#202124] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#77738A]">
                <span>1 chunk (Focused)</span>
                <span>5 chunks (Optimal Balance)</span>
                <span>15 chunks (Deep Context)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System & Engine Diagnostic Info */}
        <Card className="border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card">
          <CardHeader>
            <h3 className="text-xs font-bold text-[#202124] dark:text-white uppercase tracking-wider">
              Diagnostic & Engine Verification
            </h3>
            <p className="text-xs text-[#77738A] dark:text-[#A8A499] mt-0.5">
              Live status of backend microservices, models, and databases
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#1A1A1C] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#202124] dark:text-white">Relational DB</p>
                  <p className="text-[11px] text-[#77738A]">Neon PostgreSQL</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E5F4DC] text-[#245B32] border border-[#DDF2C1]">
                  {health?.database || 'Healthy'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#1A1A1C] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#202124] dark:text-white">Vector Store</p>
                  <p className="text-[11px] text-[#77738A]">pgvector (Cosine)</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E5F4DC] text-[#245B32] border border-[#DDF2C1]">
                  {health?.vector_store || 'Healthy'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#1A1A1C] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#202124] dark:text-white">LLM Engine</p>
                  <p className="text-[11px] text-[#77738A]">Ollama Llama 3.2</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E5F4DC] text-[#245B32] border border-[#DDF2C1]">
                  {health?.ollama || 'Healthy'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#1A1A1C] flex items-center justify-between">
                <div>
                  <p className="font-bold text-[#202124] dark:text-white">Embedding Service</p>
                  <p className="text-[11px] text-[#77738A]">nomic-embed-text (768d)</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E5F4DC] text-[#245B32] border border-[#DDF2C1]">
                  Verified
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
