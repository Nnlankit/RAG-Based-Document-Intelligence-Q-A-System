import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, FileText, ArrowRight, Search, Plus } from 'lucide-react';
import { documentService } from '../services/documentService';
import { useChatSettings } from '../context/ChatSettingsContext';
import { DocumentCard } from '../components/documents/DocumentCard';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { useNavigate } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { favorites } = useChatSettings();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: docData, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.listDocuments(),
  });

  const documents = docData?.documents || [];
  const favoriteDocs = documents.filter((d) => favorites.includes(d.id));
  const filteredFavorites = favoriteDocs.filter((d) =>
    d.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFF1CC] border border-[#FFE89A] flex items-center justify-center text-[#D99A24]">
              <Star className="w-4 h-4 fill-current" />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-[#202124] dark:text-white">
              Favorite Documents
            </h1>
          </div>
          <p className="text-xs text-[#77738A] dark:text-[#A8A499] mt-1 font-medium">
            Quickly access and ask questions about your pinned documents across sessions
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => navigate('/documents')}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          Browse All Documents
        </Button>
      </div>

      {/* Search Filter Bar */}
      {favoriteDocs.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-[#202124] rounded-2xl border border-[#E9E1CC] dark:border-[#303238] shadow-card">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#77738A] absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search your starred documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#FFF9E8] dark:bg-[#1A1A1C] border border-[#E9E1CC] dark:border-[#303238] text-[#202124] dark:text-[#FFFDF5] placeholder-[#77738A]/70 focus:outline-none focus:ring-2 focus:ring-[#FFE89A]"
            />
          </div>
          <span className="text-xs text-[#77738A] dark:text-[#A8A499] ml-auto">
            {filteredFavorites.length} starred documents
          </span>
        </div>
      )}

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : favoriteDocs.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border-2 border-dashed border-[#E9E1CC] dark:border-[#303238] bg-white dark:bg-[#202124] shadow-card space-y-3">
          <Star className="w-12 h-12 text-[#D99A24] mx-auto opacity-70" />
          <h3 className="text-base font-bold text-[#202124] dark:text-white">
            No favorite documents yet
          </h3>
          <p className="text-xs text-[#77738A] dark:text-[#A8A499] max-w-sm mx-auto">
            Click the star icon on any document card or table row in the repository to pin it here for instant access.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/documents')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Browse Repository
            </Button>
          </div>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#77738A]">
          No starred documents match "{searchTerm}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFavorites.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
};
