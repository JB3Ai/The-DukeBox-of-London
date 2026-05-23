import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PHASE_COLORS, VIBE_TAGS } from '../data/constants';
import { useTheme } from '../hooks/useTheme';
import { useApi } from '../hooks/useApi';
import GenreCard from '../components/GenreCard';

const TAG_PHASE_MAP = {
  '#Warehouse': 1, '#BassWeight': 1, '#DarkRoom': 1, '#SoundSystem': 1,
  '#FabricLondon': 2, '#UKGarage': 2, '#Berghain': 2, '#PirateRadio': 2,
  '#SunrisePatio': 3, '#RainyAfternoon': 3,
  '#LofiStudy': 4, '#AfterHours': 4,
};

export default function SearchDiscover({ activePhase, onSelectGenre, onBack }) {
  const t = useTheme();
  const { get } = useApi();
  const [genres, setGenres] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);

  useEffect(() => { get('/api/genres').then(setGenres).catch(() => {}); }, [get]);

  const results = useMemo(() => {
    let pool = genres;
    if (activeTag) {
      const phaseFilter = TAG_PHASE_MAP[activeTag];
      if (phaseFilter) pool = pool.filter(g => g.phase === phaseFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      pool = pool.filter(g => g.name.toLowerCase().includes(q) || g.code.toLowerCase().includes(q));
    }
    return pool.slice(0, 20);
  }, [genres, search, activeTag]);

  return (
    <div data-testid="search-discover-page" className="min-h-screen px-6 py-8">
      <div className="texture-grain-subtle fixed inset-0 pointer-events-none z-0" />
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button data-testid="search-back-btn" className="font-data text-[10px] tracking-widest mb-2 block transition-colors hover:opacity-80" style={{ color: t.textMuted }} onClick={onBack}>
            &larr; BACK
          </button>
          <h1 className="font-display text-4xl tracking-tighter" style={{ color: t.text }}>SEARCH & DISCOVER</h1>
          <p className="font-data text-[10px] tracking-widest mt-1" style={{ color: t.textMuted }}>
            FIND YOUR VIBE ACROSS 51 SUB-GENRES
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-8">
          <div className="glass-card rounded-xl p-1 flex items-center" style={{ border: `1px solid ${search ? t.accent + '40' : t.border}` }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.textMuted} strokeWidth="2" className="ml-3 shrink-0">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              data-testid="discover-search-input"
              type="text"
              placeholder="Search genres, artists, vibes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-3 py-3 bg-transparent font-ui text-sm focus:outline-none"
              style={{ color: t.text }}
            />
            {search && (
              <button className="px-3 font-data text-[9px]" style={{ color: t.textMuted }} onClick={() => setSearch('')}>CLEAR</button>
            )}
          </div>
        </div>

        {/* Vibe Tags */}
        <div className="mb-10">
          <span className="font-data text-[9px] tracking-widest block mb-4" style={{ color: t.textMuted }}>VIBE TAGS</span>
          <div className="flex flex-wrap gap-2">
            {VIBE_TAGS.map(tag => {
              const isActive = activeTag === tag;
              const phaseNum = TAG_PHASE_MAP[tag];
              const tagColor = phaseNum ? PHASE_COLORS[phaseNum].accent : t.accent;
              return (
                <motion.button
                  key={tag}
                  data-testid={`vibe-tag-${tag.replace('#', '')}`}
                  className="px-4 py-2 rounded-full font-ui text-xs font-semibold transition-all"
                  style={{
                    background: isActive ? `${tagColor}18` : 'transparent',
                    border: `1px solid ${isActive ? tagColor : t.border}`,
                    color: isActive ? tagColor : t.textSecondary,
                    boxShadow: isActive ? `0 0 12px ${tagColor}30` : 'none',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTag(isActive ? null : tag)}
                >
                  {tag}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Active tag description */}
        {activeTag && (
          <motion.div
            className="glass-card rounded-xl p-4 mb-8 flex items-center gap-4"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: PHASE_COLORS[TAG_PHASE_MAP[activeTag]]?.accent || t.accent, boxShadow: `0 0 8px ${PHASE_COLORS[TAG_PHASE_MAP[activeTag]]?.glow || t.glow}` }} />
            <div>
              <span className="font-ui text-sm font-bold" style={{ color: t.text }}>{activeTag}</span>
              <span className="font-data text-[9px] ml-3" style={{ color: t.textMuted }}>
                PHASE {TAG_PHASE_MAP[activeTag]} — {PHASE_COLORS[TAG_PHASE_MAP[activeTag]]?.name}
              </span>
            </div>
            <span className="ml-auto font-data text-[10px]" style={{ color: t.textMuted }}>{results.length} results</span>
          </motion.div>
        )}

        {/* Results grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {results.map((genre, i) => (
            <motion.div
              key={genre.code}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <GenreCard genre={genre} isActive={false} onClick={() => onSelectGenre(genre)} />
            </motion.div>
          ))}
        </div>

        {results.length === 0 && (
          <div className="text-center py-20">
            <span className="font-display text-2xl" style={{ color: t.textMuted }}>No vibes found</span>
            <p className="font-editorial text-sm mt-2" style={{ color: t.textMuted }}>
              {search ? 'Try a different search term.' : 'Select a vibe tag to explore.'}
            </p>
            <p className="font-data text-[10px] mt-4" style={{ color: t.textMuted }}>
              Connection lost — your groove is buffered locally.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
