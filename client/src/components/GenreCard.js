import React from 'react';
import { motion } from 'framer-motion';
import { PHASE_COLORS } from '../data/constants';
import { useTheme } from '../hooks/useTheme';

export default function GenreCard({ genre, isActive, onClick }) {
  const t = useTheme();
  const pc = PHASE_COLORS[genre.phase] || PHASE_COLORS[1];

  return (
    <motion.button
      data-testid={`genre-card-${genre.code}`}
      className="glass-card rounded-xl p-4 text-left relative overflow-hidden group"
      style={{
        borderColor: isActive ? pc.accent : undefined,
        boxShadow: isActive ? `0 0 20px ${pc.glow}` : undefined,
      }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(genre)}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 50%, ${pc.accent}08, transparent 70%)` }}
      />
      <span className="font-data text-[10px] tracking-widest block mb-2" style={{ color: `${pc.accent}80` }}>
        {genre.code}
      </span>
      <h3 className="font-ui text-sm font-semibold leading-tight mb-2" style={{ color: t.text }}>
        {genre.name}
      </h3>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: pc.accent, boxShadow: `0 0 4px ${pc.accent}` }} />
        <span className="font-data text-[10px]" style={{ color: t.textMuted }}>
          {genre.bpm[0]}–{genre.bpm[1]} BPM
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${pc.accent}60, transparent)` }} />
    </motion.button>
  );
}
