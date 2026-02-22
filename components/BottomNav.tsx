'use client';
import React from 'react';
import { Home, Search, Grid2X2, Heart, User } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';
import { useRouter, usePathname } from 'next/navigation';

interface P { onSearchOpen: () => void; }
export const BottomNav: React.FC<P> = ({ onSearchOpen }) => {
  const { watchlist } = useWatchlist();
  const router = useRouter();
  const path = usePathname();
  const tabs = [
    { id: 'home', Icon: Home, label: 'Home', action: () => router.push('/') },
    { id: 'search', Icon: Search, label: 'Search', action: onSearchOpen },
    { id: 'browse', Icon: Grid2X2, label: 'Browse', action: () => router.push('/category/all') },
    { id: 'mylist', Icon: Heart, label: 'My List', action: () => router.push('/profile'), badge: watchlist.length },
    { id: 'profile', Icon: User, label: 'Profile', action: () => router.push('/profile') },
  ];
  const active = path === '/' ? 'home' : path.startsWith('/category') ? 'browse' : path.startsWith('/profile') ? 'profile' : '';

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[92%] max-w-md" style={{ transform: 'translateX(-50%)' }}>
      <nav className="nav-cosmos flex items-center justify-around px-1 py-2">
        {tabs.map(({ id, Icon, label, action, badge }) => {
          const on = active === id;
          return (
            <button key={id} onClick={action}
              className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl active:scale-88 transition-all duration-200 ripple"
              style={{ background: on ? 'rgba(255,10,60,.12)' : 'transparent' }}>
              <div className="relative">
                <Icon size={21} strokeWidth={on ? 2.2 : 1.6}
                  style={{
                    color: on ? 'var(--nova)' : 'rgba(255,255,255,.28)',
                    filter: on ? 'drop-shadow(0 0 7px rgba(255,10,60,.75))' : 'none',
                    transform: on ? 'scale(1.12)' : 'scale(1)',
                    transition: 'all .25s ease',
                  }} />
                {badge && badge > 0 ? (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-white"
                    style={{ background: 'var(--nova)', fontSize: 8, fontWeight: 900, boxShadow: '0 0 8px rgba(255,10,60,.5)' }}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                ) : null}
              </div>
              {on && <span style={{ fontSize: 8, fontWeight: 800, color: 'var(--nova)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
