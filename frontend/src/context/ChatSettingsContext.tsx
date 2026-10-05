import React, { createContext, useContext, useState, useEffect } from 'react';

interface ChatSettingsContextType {
  similarityThreshold: number;
  setSimilarityThreshold: (val: number) => void;
  topK: number;
  setTopK: (val: number) => void;
  scopeDocumentIds: string[];
  setScopeDocumentIds: (ids: string[]) => void;
  toggleScopeDocumentId: (id: string) => void;
  clearScope: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

const ChatSettingsContext = createContext<ChatSettingsContextType | undefined>(undefined);

export const ChatSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('documind_sim_threshold');
    return saved ? parseFloat(saved) : 0.35;
  });

  const [topK, setTopK] = useState<number>(() => {
    const saved = localStorage.getItem('documind_top_k');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [scopeDocumentIds, setScopeDocumentIds] = useState<string[]>([]);

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('documind_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('documind_sim_threshold', similarityThreshold.toString());
  }, [similarityThreshold]);

  useEffect(() => {
    localStorage.setItem('documind_top_k', topK.toString());
  }, [topK]);

  useEffect(() => {
    localStorage.setItem('documind_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleScopeDocumentId = (id: string) => {
    setScopeDocumentIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const clearScope = () => {
    setScopeDocumentIds([]);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favorites.includes(id);

  return (
    <ChatSettingsContext.Provider
      value={{
        similarityThreshold,
        setSimilarityThreshold,
        topK,
        setTopK,
        scopeDocumentIds,
        setScopeDocumentIds,
        toggleScopeDocumentId,
        clearScope,
        favorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </ChatSettingsContext.Provider>
  );
};

export const useChatSettings = () => {
  const context = useContext(ChatSettingsContext);
  if (!context) {
    throw new Error('useChatSettings must be used within a ChatSettingsProvider');
  }
  return context;
};
