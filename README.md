# MFLIX v4.0 — Future Streaming Platform
### Beyond Netflix · Beyond Prime · Beyond Hotstar

---

## 🚀 Setup

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
```

## 🌐 Deploy to Vercel
1. Push this folder to GitHub (private repo recommended)
2. Go to vercel.com → New Project → Import repo
3. Framework: Next.js (auto-detected)
4. Deploy!

---

## 🔥 Features

### AI-Powered (Claude API)
- **AI Mood Picks** — Pick a mood, Claude finds perfect movies
- **AI Search** — Describe what you want, AI understands intent
- **Smart Recommendations** — Context-aware filtering

### Future UI/UX
- **Aurora animated background** — Living, breathing purple/cyan gradients
- **Cinematic splash screen** — Letter-by-letter logo animation
- **Ken Burns hero** — Slow zoom on backdrop images
- **3D card hover** — Depth with translateY + scale
- **Glassmorphism 4.0** — 28px blur, saturation boost, inset glow
- **Vertical slide dots** — Mini poster previews in hero

### Streaming Features
- **All quality levels** — 4K, 1080p, 720p, 480p
- **Continue Watching** — Auto-saves progress every 5s
- **My List (Watchlist)** — Saved across sessions
- **Watch History** — With progress bars
- **Episode viewer** — Full seasons/episodes support
- **Download links** — All formats with file size

### Design System
- **Syne** display font (cinematic headings)
- **Plus Jakarta Sans** body font (premium readability)
- **CSS Variables** — Fully themeable
- **Neon glow system** — Red, cyan, purple, gold accents
- **Badge system** — Quality, Rating, New, AI, Language

### Pages
- `/` — Home (Hero + AI + 10+ rows)
- `/player/[id]` — Movie player + details
- `/category/[genre]` — Browse with sort + filter
- `/profile` — My List, History, Settings

### Performance
- Skeleton loaders (no spinners)
- Lazy loading images
- React.memo & useCallback optimization
- localStorage for all persistence
- PWA manifest included

---

## 📁 Structure

```
mflix_fixed/
├── app/
│   ├── globals.css          ← Complete design system
│   ├── layout.tsx           ← Providers + fonts
│   ├── page.tsx             ← Home page
│   ├── player/[id]/page.tsx ← Movie player
│   ├── category/[genre]/    ← Browse page
│   └── profile/             ← User profile
├── components/
│   ├── HeroBanner.tsx       ← Cinematic hero
│   ├── MovieCard.tsx        ← 3D card
│   ├── MovieRow.tsx         ← Horizontal scroll row
│   ├── BottomNav.tsx        ← 5-tab nav pill
│   ├── SearchOverlay.tsx    ← AI + normal search
│   ├── AiRecommendations.tsx← Claude AI moods
│   ├── SplashScreen.tsx     ← Cinematic splash
│   ├── SkeletonLoader.tsx   ← Loading states
│   ├── NetworkStatus.tsx    ← Offline banner
│   └── ScrollToTop.tsx      ← Floating button
├── context/
│   ├── WatchlistContext.tsx  ← My List state
│   └── ToastContext.tsx     ← Notifications
├── hooks/
│   └── useWatchHistory.ts   ← Watch progress
├── services/
│   └── firebaseService.ts   ← Firebase REST API
└── types.ts                 ← TypeScript types
```

---

## 🎨 Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--void` | `#010206` | Main background |
| `--red` | `#ff0a3c` | Primary CTA |
| `--cyan` | `#00d9ff` | AI / Continue watching |
| `--purple` | `#8b2fff` | AI features |
| `--gold` | `#ffd60a` | Ratings / Bollywood |
| `--green` | `#00ff88` | New / Success |

---

Made with ❤️ — MFLIX v4.0 · Cinema. Redefined.
