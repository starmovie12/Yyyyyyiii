'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Movie } from '../types';

interface WatchlistContextType {
  watchlist: Movie[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
  toggleWatchlist: (movie: Movie) => void;
}

const WatchlistContext = createContext<WatchlistContextType>({
  watchlist: [],
  addToWatchlist: () => {},
  removeFromWatchlist: () => {},
  isInWatchlist: () => false,
  toggleWatchlist: () => {},
});

export const useWatchlist = () => useContext(WatchlistContext);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<Movie[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('mflix_watchlist');
      if (saved) setWatchlist(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (list: Movie[]) => {
    setWatchlist(list);
    try { localStorage.setItem('mflix_watchlist', JSON.stringify(list)); } catch {}
  };

  const addToWatchlist = useCallback((movie: Movie) => {
    setWatchlist(prev => {
      if (prev.find(m => m.movie_id === movie.movie_id)) return prev;
      const next = [movie, ...prev];
      try { localStorage.setItem('mflix_watchlist', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist(prev => {
      const next = prev.filter(m => m.movie_id !== id);
      try { localStorage.setItem('mflix_watchlist', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const isInWatchlist = useCallback((id: string) => watchlist.some(m => m.movie_id === id), [watchlist]);

  const toggleWatchlist = useCallback((movie: Movie) => {
    if (isInWatchlist(movie.movie_id)) removeFromWatchlist(movie.movie_id);
    else addToWatchlist(movie);
  }, [isInWatchlist, addToWatchlist, removeFromWatchlist]);

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, toggleWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
};
