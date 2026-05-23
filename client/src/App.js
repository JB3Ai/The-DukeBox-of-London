import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import Hero from './pages/Hero';
import Dashboard from './pages/Dashboard';
import GenreExplorer from './pages/GenreExplorer';
import NowPlaying from './pages/NowPlaying';
import SmartMixer from './pages/SmartMixer';
import SearchDiscover from './pages/SearchDiscover';
import History from './pages/History';
import Settings from './pages/Settings';
import OnboardingFlow from './components/OnboardingFlow';
import ShareModal from './components/ShareModal';
import './App.css';

const PHASE_SKIN_MAP = { 1: 'obsidian', 2: 'original', 3: 'glass', 4: 'paper' };
const API = process.env.REACT_APP_BACKEND_URL;

const NAV_ITEMS = [
  { id: 'dashboard', label: 'HOME', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'genres', label: 'GENRES', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { id: 'search', label: 'DISCOVER', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { id: 'playing', label: 'PLAYING', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'mixer', label: 'MIXER', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
  { id: 'history', label: 'VAULT', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { id: 'settings', label: 'SETTINGS', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

function NavIcon({ path, color, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function AppShell({ page, setPage, activePhase, setActivePhase, activeSkin, setActiveSkin, autoSkin, setAutoSkin, currentTrack, setCurrentTrack, showOnboarding, setShowOnboarding, hasOnboarded, setHasOnboarded, shareTrack, setShareTrack }) {
  const t = useTheme();

  const conductTrack = useCallback(async (params) => {
    const res = await fetch(`${API}/api/conduct`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
    if (!res.ok) throw new Error('Conduct failed');
    return res.json();
  }, []);

  const handleConduct = useCallback(() => {
    if (!hasOnboarded) { setShowOnboarding(true); }
    else { setPage('playing'); }
  }, [hasOnboarded, setShowOnboarding, setPage]);

  const handleOnboardingComplete = useCallback(async (params) => {
    setShowOnboarding(false);
    setHasOnboarded(true);
    try {
      const track = await conductTrack({ phase: activePhase, ...params });
      setCurrentTrack(track);
    } catch (_) { /* conduct error */ }
    setPage('playing');
  }, [activePhase, conductTrack, setCurrentTrack, setPage, setShowOnboarding, setHasOnboarded]);

  const handleSelectGenre = useCallback((genre) => {
    setActivePhase(genre.phase);
    setPage('playing');
  }, [setActivePhase, setPage]);

  const handleReconduct = useCallback((track) => {
    setCurrentTrack(track);
    if (track.phase) setActivePhase(track.phase);
    setPage('playing');
  }, [setCurrentTrack, setActivePhase, setPage]);

  const handleShare = useCallback((track) => {
    setShareTrack(track);
  }, [setShareTrack]);

  const handleShareFromVault = useCallback((track) => {
    setShareTrack(track);
  }, [setShareTrack]);

  return (
    <div className="min-h-screen relative" style={{ background: t.bg, color: t.text, transition: 'background 0.5s ease, color 0.5s ease' }}>
      <div className="shimmer-edge" />
      <div className="texture-grain-subtle fixed inset-0 pointer-events-none z-[1]" />

      <header className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between" style={{ background: `${t.bg}CC`, backdropFilter: 'blur(24px)', borderBottom: `1px solid ${t.border}`, transition: 'background 0.5s ease' }}>
        <div className="flex items-center gap-3">
          <motion.div className="w-2 h-2 rounded-full" style={{ background: t.accent, boxShadow: `0 0 8px ${t.glow}` }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <span className="font-display text-lg tracking-tighter" style={{ color: t.accent }}>JUKEBOX</span>
          <span className="font-data text-[8px] tracking-[0.2em] hidden md:block" style={{ color: t.textMuted }}>LONDON LEGEND EDITION</span>
          {autoSkin && <span data-testid="auto-skin-badge" className="font-data text-[7px] tracking-wider px-2 py-0.5 rounded-full hidden md:block" style={{ background: `${t.accent}15`, color: t.accent, border: `1px solid ${t.accent}30` }}>AUTO</span>}
        </div>

        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = page === item.id;
            return (
              <button key={item.id} data-testid={`nav-tab-${item.id}`}
                className="relative px-3 py-2 rounded-lg font-data text-[9px] tracking-wider transition-all"
                style={{ color: isActive ? t.accent : t.textMuted, background: isActive ? `${t.accent}10` : 'transparent' }}
                onClick={() => setPage(item.id)}>
                {item.label}
                {isActive && <motion.div className="absolute bottom-0 left-2 right-2 h-px" style={{ background: t.accent }} layoutId="nav-underline" />}
              </button>
            );
          })}
        </nav>

        {currentTrack && page !== 'playing' && (
          <motion.button data-testid="mini-player-btn" className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card" onClick={() => setPage('playing')} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.05 }}>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((i) => (<motion.div key={i} className="w-0.5 rounded-full" style={{ background: t.accent }} animate={{ height: [4, 12, 6, 10, 4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }} />))}
            </div>
            <span className="font-data text-[9px] max-w-[100px] truncate" style={{ color: t.textSecondary }}>{currentTrack.name}</span>
          </motion.button>
        )}
      </header>

      <main className="pb-20 md:pb-8 relative z-[2]">
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            {page === 'dashboard' && <Dashboard activePhase={activePhase} setActivePhase={setActivePhase} onConduct={handleConduct} onNavigate={setPage} />}
            {page === 'genres' && <GenreExplorer activePhase={activePhase} onSelectGenre={handleSelectGenre} onBack={() => setPage('dashboard')} />}
            {page === 'search' && <SearchDiscover activePhase={activePhase} onSelectGenre={handleSelectGenre} onBack={() => setPage('dashboard')} />}
            {page === 'playing' && <NowPlaying activePhase={activePhase} currentTrack={currentTrack} setCurrentTrack={setCurrentTrack} onBack={() => setPage('dashboard')} onShare={handleShare} />}
            {page === 'mixer' && <SmartMixer activePhase={activePhase} setActivePhase={setActivePhase} onBack={() => setPage('dashboard')} currentTrack={currentTrack} setCurrentTrack={setCurrentTrack} />}
            {page === 'history' && <History onBack={() => setPage('dashboard')} onReconduct={handleReconduct} onShare={handleShareFromVault} />}
            {page === 'settings' && <Settings activeSkin={activeSkin} setActiveSkin={setActiveSkin} autoSkin={autoSkin} setAutoSkin={setAutoSkin} onBack={() => setPage('dashboard')} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-50 px-2 py-2 flex items-center justify-around" style={{ background: `${t.bg}EE`, backdropFilter: 'blur(24px)', borderTop: `1px solid ${t.border}` }}>
        {NAV_ITEMS.map((item) => {
          const isActive = page === item.id;
          return (
            <button key={item.id} data-testid={`mobile-nav-${item.id}`} className="flex flex-col items-center gap-0.5 py-1 px-2" onClick={() => setPage(item.id)}>
              <NavIcon path={item.icon} color={isActive ? t.accent : t.textMuted} size={16} />
              <span className="font-data text-[6px] tracking-wider" style={{ color: isActive ? t.accent : t.textMuted }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <AnimatePresence>
        {showOnboarding && <OnboardingFlow phase={activePhase} onComplete={handleOnboardingComplete} onClose={() => setShowOnboarding(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {shareTrack && <ShareModal track={shareTrack} onClose={() => setShareTrack(null)} />}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [showHero, setShowHero] = useState(true);
  const [page, setPage] = useState('dashboard');
  const [activePhase, setActivePhase] = useState(1);
  const [activeSkin, setActiveSkin] = useState('original');
  const [autoSkin, setAutoSkin] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [shareTrack, setShareTrack] = useState(null);

  // Vibe Link deep-linking: check URL for ?vibe=CODE on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vibeCode = params.get('vibe');
    if (vibeCode) {
      // Skip hero, skip onboarding, load vibe link params
      setShowHero(false);
      setHasOnboarded(true);
      (async () => {
        try {
          const res = await fetch(`${API}/api/vibe-link/${vibeCode}`);
          if (!res.ok) return;
          const link = await res.json();
          // Conduct with the vibe link's seed params
          setActivePhase(link.phase || 1);
          const conductRes = await fetch(`${API}/api/conduct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phase: link.phase || 1,
              atmosphere: link.atmosphere || 'balanced',
              bpm: link.bpm || 128,
              genre_code: link.genre_code,
              vocal_style: link.vocal_style,
            }),
          });
          if (conductRes.ok) {
            const track = await conductRes.json();
            setCurrentTrack(track);
            setPage('playing');
          }
        } catch (_) { /* vibe link load error */ }
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
      })();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-skin
  useEffect(() => {
    if (autoSkin) {
      const target = PHASE_SKIN_MAP[activePhase];
      if (target && target !== activeSkin) setActiveSkin(target);
    }
  }, [activePhase, autoSkin]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetSkin = useCallback((skin) => {
    setActiveSkin(skin);
    if (autoSkin) setAutoSkin(false);
  }, [autoSkin]);

  return (
    <ThemeProvider skinKey={activeSkin} phaseCode={activePhase}>
      <AnimatePresence>
        {showHero && <Hero onEnter={() => setShowHero(false)} />}
      </AnimatePresence>

      {!showHero && (
        <AppShell
          page={page} setPage={setPage}
          activePhase={activePhase} setActivePhase={setActivePhase}
          activeSkin={activeSkin} setActiveSkin={handleSetSkin}
          autoSkin={autoSkin} setAutoSkin={setAutoSkin}
          currentTrack={currentTrack} setCurrentTrack={setCurrentTrack}
          showOnboarding={showOnboarding} setShowOnboarding={setShowOnboarding}
          hasOnboarded={hasOnboarded} setHasOnboarded={setHasOnboarded}
          shareTrack={shareTrack} setShareTrack={setShareTrack}
        />
      )}
    </ThemeProvider>
  );
}
