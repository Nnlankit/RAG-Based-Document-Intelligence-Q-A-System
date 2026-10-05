import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, FileText, ArrowRight } from 'lucide-react';
import { documentService } from '../services/documentService';
import { useChatSettings } from '../context/ChatSettingsContext';
import { DocumentCard } from '../components/documents/DocumentCard';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

export const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const { favorites } = useChatSettings();

  const { data: docData, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentService.listDocuments(),
  });

  const documents = docData?.documents || [];
  const favoriteDocs = documents.filter((d) => favorites.includes(d.id));

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-[#B38A4A] fill-current" />
          <h1 className="text-xl font-bold tracking-tight text-[#30261E] dark:text-[#F7F0E3]">
            Favorite Documents
          </h1>
        </div>
        <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] mt-0.5">
          Quickly access bookmarked documents saved across your sessions
        </p>
      </div>

      {favoriteDocs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border-2 border-dashed border-[#D4C3A5] dark:border-[#524436] bg-[#F7F0E3] dark:bg-[#342A22] space-y-3 shadow-card">
          <Star className="w-10 h-10 text-[#8B6F52] mx-auto" />
          <h4 className="text-sm font-semibold text-[#30261E] dark:text-[#F7F0E3]">
            No favorite documents yet
          </h4>
          <p className="text-xs text-[#5A4634] dark:text-[#DCC9AA] max-w-sm mx-auto">
            Click the star icon on any document card or table row in the repository to pin it here.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/documents')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Browse Documents
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteDocs.map((doc) => (
            <DocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      )}
    </div>
  );
};
