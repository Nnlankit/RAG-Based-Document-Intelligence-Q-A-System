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
      <div className="p-6 md:p-8 rounded-3xl bg-[#FFF9E8] dark:bg-[#202124] border border-[#E9E1CC] dark:border-[#303238] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#202124] border-2 border-[#303238] flex items-center justify-center text-[#FFE89A] text-2xl font-extrabold shadow-subtle">
            AM
          </div>
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#202124] dark:text-white">
              {name}
            </h1>
            <p className="text-xs text-[#77738A] dark:text-[#A8A499] flex items-center gap-2">
              <span>{role}</span>
              <span>•</span>
              <span>{org}</span>
            </p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E5F4DC] text-[#245B32] border border-[#DDF2C1] text-[10px] font-bold uppercase tracking-wider">
              <Zap className="w-3 h-3 text-[#D99A24]" />
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
          <Card className="border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card">
            <CardHeader>
              <h3 className="text-xs font-bold text-[#202124] dark:text-white uppercase tracking-wider">
                Personal Information
              </h3>
              <p className="text-xs text-[#77738A] dark:text-[#A8A499] mt-0.5">
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
          <Card className="border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card">
            <CardHeader>
              <h3 className="text-xs font-bold text-[#202124] dark:text-white uppercase tracking-wider">
                Security & API Credentials
              </h3>
              <p className="text-xs text-[#77738A] dark:text-[#A8A499] mt-0.5">
                Local API endpoints and vector access credentials
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-xl border border-[#E9E1CC] dark:border-[#303238] bg-[#FFFDF5] dark:bg-[#1A1A1C] flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-[#202124] dark:text-white">Active Session Token</p>
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
          <Card className="border border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#77738A] uppercase tracking-wider">Current Tier</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E5F4DC] text-[#245B32] border border-[#DDF2C1]">PRO</span>
            </div>

            <div>
              <p className="text-lg font-extrabold text-[#202124] dark:text-white">Pro Workspace</p>
              <p className="text-xs text-[#77738A] mt-0.5">Unlimited Local Llama 3.2 inference with pgvector indexing</p>
            </div>

            {/* Storage Meter */}
            <div className="space-y-1.5 pt-2 border-t border-[#E9E1CC] dark:border-[#303238]">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#202124] dark:text-white">
                  <HardDrive className="w-3.5 h-3.5 text-[#202124] dark:text-[#FFE89A]" />
                  Storage Used
                </span>
                <span className="text-[#202124] dark:text-[#FFE89A] font-mono">{storageMB} MB / 1 GB</span>
              </div>
              <div className="w-full bg-[#FFF9E8] dark:bg-[#1A1A1C] h-2 rounded-full overflow-hidden border border-[#E9E1CC] dark:border-[#303238]">
                <div
                  className="bg-[#4D9B45] h-full rounded-full"
                  style={{ width: `${Math.max(Math.round((totalBytes / (1024 * 1024 * 1024)) * 100), 5)}%` }}
                />
              </div>
            </div>

            {/* Queries Count */}
            <div className="space-y-1.5 pt-2 border-t border-[#E9E1CC] dark:border-[#303238]">
              <div className="flex justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-[#202124] dark:text-white">
                  <Activity className="w-3.5 h-3.5 text-[#4D9B45]" />
                  Total Queries
                </span>
                <span className="text-[#4D9B45] font-mono">{totalQueries} answers</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
