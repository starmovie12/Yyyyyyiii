import { useState, useEffect, useCallback } from 'react';
import { Movie } from '../types';

interface WatchHistoryItem {
  movie: Movie;
  progress: number;
  lastWatched: number;
  currentTime: number;
  duration: number;
}

export const useWatchHistory = () => {
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mflix_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch {}
  }, []);

  const saveProgress = useCallback((movie: Movie, currentTime: number, duration: number) => {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    setHistory(prev => {
      const filtered = prev.filter(h => h.movie.movie_id !== movie.movie_id);
      const next = [{ movie, progress, lastWatched: Date.now(), currentTime, duration }, ...filtered].slice(0, 10);
      try { localStorage.setItem('mflix_history', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const getProgress = useCallback((id: string) => {
    const item = history.find(h => h.movie.movie_id === id);
    return item ? { progress: item.progress, currentTime: item.currentTime } : null;
  }, [history]);

  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const next = prev.filter(h => h.movie.movie_id !== id);
      try { localStorage.setItem('mflix_history', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try { localStorage.removeItem('mflix_history'); } catch {}
  }, []);

  return { history, saveProgress, getProgress, removeFromHistory, clearHistory };
};
