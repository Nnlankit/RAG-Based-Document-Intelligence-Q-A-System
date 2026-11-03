import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Shield,
  Key,
  CreditCard,
  HardDrive,
  Activity,
  CheckCircle2,
  Sparkles,
  Zap,
  Mail,
  Building,
  Save,
} from 'lucide-react';
import { analyticsService } from '../services/analyticsService';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useToast } from '../components/common/Toast';

export const ProfilePage: React.FC = () => {
  const { success } = useToast();

  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex.morgan@documind.ai');
  const [org, setOrg] = useState('Enterprise Document Intelligence Group');
  const [role, setRole] = useState('Senior AI Analyst');

  const { data: stats } = useQuery({
    queryKey: ['analytics-stats'],
    queryFn: () => analyticsService.getStats(),
  });

  const totalBytes = stats?.overview?.total_storage_bytes || 0;
  const storageMB = (totalBytes / (1024 * 1024)).toFixed(1);
  const totalQueries = stats?.overview?.total_queries || 0;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    success('Profile Updated', 'Your user preferences have been saved.');
  };

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Profile Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-[#5920B5] to-[#8B5CF6] text-white shadow-purple-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white text-2xl font-extrabold shadow-purple">
            AM
          </div>
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              {name}
            </h1>
            <p className="text-xs text-[#E2DCF0] flex items-center gap-2">
              <span>{role}</span>
              <span>•</span>
              <span>{org}</span>
            </p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 text-amber-300" />
              Pro Workspace Tier
            </span>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => success('Plan Active', 'Your Pro Workspace plan is currently in good standing.')}
          className="self-start sm:self-auto shadow-sm"
        >
          Manage Subscription
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Profile Details Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card">
            <CardHeader>
              <h3 className="text-xs font-bold text-[#17152B] dark:text-white uppercase tracking-wider">
                Personal Information
              </h3>
              <p className="text-xs text-[#77738A] dark:text-[#A39EB8] mt-0.5">
                Update your account details and organizational profile
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Organization"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                  />
                  <Input
                    label="Job Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security & Access */}
          <Card className="border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card">
            <CardHeader>
              <h3 className="text-xs font-bold text-[#17152B] dark:text-white uppercase tracking-wider">
                Security & API Credentials
              </h3>
              <p className="text-xs text-[#77738A] dark:text-[#A39EB8] mt-0.5">
                Local API endpoints and vector access credentials
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-xl border border-[#E8E1F2] dark:border-[#352B52] bg-[#FAF8FD] dark:bg-[#150F24] flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#17152B] dark:text-white">Active Session Token</p>
                  <p className="text-[11px] font-mono text-[#77738A]">documind_sec_••••••••••••9f21</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => success('Key Regenerated', 'API token successfully rotated.')}
                >
                  Regenerate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 col: Usage Quota & Workspace Tier */}
        <div className="space-y-6">
          <Card className="border border-[#E8E1F2] dark:border-[#352B52] bg-white dark:bg-[#1E1733] shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#77738A] uppercase tracking-wider">Current Tier</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F0EBFA] text-[#5920B5]">PRO</span>
            </div>

            <div>
              <p className="text-lg font-extrabold text-[#17152B] dark:text-white">Pro Workspace</p>
              <p className="text-xs text-[#77738A] mt-0.5">Unlimited Local Llama 3.2 inference with pgvector indexing</p>
            </div>

            {/* Storage Meter */}
            <div className="space-y-1.5 pt-2 border-t border-[#E8E1F2] dark:border-[#352B52]">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#17152B] dark:text-white">
                  <HardDrive className="w-3.5 h-3.5 text-[#5920B5]" />
                  Storage Used
                </span>
                <span className="text-[#5920B5] font-mono">{storageMB} MB / 1 GB</span>
              </div>
              <div className="w-full bg-[#FAF8FD] dark:bg-[#150F24] h-2 rounded-full overflow-hidden border border-[#E8E1F2] dark:border-[#352B52]">
                <div
                  className="bg-gradient-to-r from-[#5920B5] to-[#8B5CF6] h-full rounded-full"
                  style={{ width: `${Math.max(Math.round((totalBytes / (1024 * 1024 * 1024)) * 100), 5)}%` }}
                />
              </div>
            </div>

            {/* Queries Count */}
            <div className="space-y-1.5 pt-2 border-t border-[#E8E1F2] dark:border-[#352B52]">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#17152B] dark:text-white">
                  <Activity className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  Total Queries
                </span>
                <span className="text-[#8B5CF6] font-mono">{totalQueries} answers</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
