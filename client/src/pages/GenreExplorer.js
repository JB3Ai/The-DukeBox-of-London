import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GenreCard from '../components/GenreCard';
import { PHASE_COLORS } from '../data/constants';
import { useTheme } from '../hooks/useTheme';
import { useApi } from '../hooks/useApi';

export default function GenreExplorer({ activePhase, onSelectGenre, onBack }) {
  const { get } = useApi();
  const t = useTheme();
  const [genres, setGenres] = useState([]);
  const [filterPhase, setFilterPhase] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => { get('/api/genres').then(setGenres).catch(() => {}); }, [get]);

  const filtered = useMemo(() => genres.filter(g => {
    if (filterPhase && g.phase !== filterPhase) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [genres, filterPhase, search]);

  const sortedGroups = useMemo(() => {
    const grouped = {};
    filtered.forEach(g => { if (!grouped[g.phase]) grouped[g.phase] = []; grouped[g.phase].push(g); });
    return Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));
  }, [filtered]);

  return (
    <div data-testid="genre-explorer-page" className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button data-testid="genre-back-btn" className="font-data text-[10px] tracking-widest mb-2 block transition-colors hover:opacity-80" style={{ color: t.textMuted }} onClick={onBack}>
              &larr; BACK
            </button>
            <h1 className="font-display text-4xl tracking-tighter" style={{ color: t.text }}>GENRE EXPLORER</h1>
            <p className="font-data text-[10px] tracking-widest mt-1" style={{ color: t.textMuted }}>
              {genres.length} SUB-GENRES ACROSS 4 ENERGY PHASES
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="flex gap-2 flex-wrap">
            <button
              data-testid="genre-filter-all"
              className="font-data text-[10px] tracking-wider px-4 py-2 rounded-full border transition-all"
              style={{
                borderColor: !filterPhase ? t.text : t.border,
                color: !filterPhase ? t.text : t.textMuted,
                background: !filterPhase ? `${t.text}08` : 'transparent',
              }}
              onClick={() => setFilterPhase(null)}
            >ALL</button>
            {[1, 2, 3, 4].map(p => {
              const pc = PHASE_COLORS[p];
              const isActive = filterPhase === p;
              return (
                <button key={p} data-testid={`genre-filter-p${p}`}
                  className="font-data text-[10px] tracking-wider px-4 py-2 rounded-full border transition-all"
                  style={{
                    borderColor: isActive ? pc.accent : t.border,
                    color: isActive ? pc.accent : t.textMuted,
                    background: isActive ? `${pc.accent}10` : 'transparent',
                    boxShadow: isActive ? `0 0 12px ${pc.glow}` : 'none',
                  }}
                  onClick={() => setFilterPhase(p)}
                >P{p} {pc.name}</button>
              );
            })}
          </div>
          <input
            data-testid="genre-search-input"
            type="text"
            placeholder="Search genres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-auto font-ui text-sm rounded-lg px-4 py-2 w-48 focus:outline-none"
            style={{
              background: 'transparent',
              border: `1px solid ${t.border}`,
              color: t.text,
            }}
          />
        </div>

        <AnimatePresence mode="sync">
          {sortedGroups.map(([phase, phaseGenres]) => {
            const pc = PHASE_COLORS[Number(phase)];
            return (
              <motion.div key={phase} className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ background: pc.accent, boxShadow: `0 0 8px ${pc.glow}` }} />
                  <h2 className="font-display text-xl tracking-tight" style={{ color: pc.accent }}>PHASE {phase}</h2>
                  <span className="font-data text-[10px]" style={{ color: t.textMuted }}>{pc.name} — {phaseGenres.length} genres</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {phaseGenres.map((genre, i) => (
                    <motion.div key={genre.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                      <GenreCard genre={genre} isActive={false} onClick={() => onSelectGenre(genre)} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <span className="font-display text-2xl" style={{ color: t.textMuted }}>No genres found</span>
            <p className="font-editorial text-sm mt-2" style={{ color: t.textMuted }}>Try a different filter or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
