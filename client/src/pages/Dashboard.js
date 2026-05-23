import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhaseSelector from '../components/PhaseSelector';
import { useTheme } from '../hooks/useTheme';
import { useApi } from '../hooks/useApi';

export default function Dashboard({ activePhase, setActivePhase, onConduct, onNavigate }) {
  const { get } = useApi();
  const t = useTheme();
  const [phases, setPhases] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    get('/api/phases').then(setPhases).catch(() => {});
    get('/api/stats').then(setStats).catch(() => {});
  }, [get]);

  const phaseInfo = phases.find(p => p.code === activePhase) || {};

  return (
    <div data-testid="dashboard-page" className="relative min-h-screen px-6 py-8">
      <motion.div
        className="fixed inset-0 pointer-events-none"
        animate={{ background: `radial-gradient(ellipse at 50% 30%, ${t.accent}05 0%, transparent 60%)` }}
        transition={{ duration: 1 }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-5xl md:text-7xl tracking-tighter" style={{ color: t.accent }}>
            JUKEBOX
          </h1>
          <p className="font-data text-[10px] tracking-[0.3em] mt-2" style={{ color: t.textMuted }}>
            LONDON LEGEND EDITION
          </p>
        </motion.div>

        <motion.div className="mb-12" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <PhaseSelector activePhase={activePhase} onSelect={setActivePhase} />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={activePhase} className="text-center mb-10" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <h2 className="font-display text-2xl tracking-tight" style={{ color: t.accent }}>
              {phaseInfo.vibe || t.phaseName}
            </h2>
            <p className="font-editorial text-sm mt-2 max-w-md mx-auto" style={{ color: t.textSecondary }}>
              {phaseInfo.description || 'Select a phase to begin conducting.'}
            </p>
            {phaseInfo.bpm_range && (
              <span className="font-data text-[10px] block mt-2" style={{ color: t.textMuted }}>
                {phaseInfo.bpm_range[0]}–{phaseInfo.bpm_range[1]} BPM
              </span>
            )}
          </motion.div>
        </AnimatePresence>

        <motion.div className="flex justify-center mb-16" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <motion.button
            data-testid="conduct-button"
            className="relative px-12 py-4 rounded-full font-ui font-bold text-lg overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${t.accent}20, ${t.accent}05)`,
              border: `1px solid ${t.accent}40`,
              color: t.accent,
            }}
            whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${t.glow}` }}
            whileTap={{ scale: 0.95 }}
            onClick={onConduct}
          >
            CONDUCT
          </motion.button>
        </motion.div>

        {stats && (
          <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            {[
              { label: 'TOTAL TRACKS', value: stats.total_tracks, color: t.text },
              { label: 'LOVED', value: stats.loved, color: t.accent },
              { label: 'VAULTED', value: stats.pinned, color: t.accent2 },
              { label: 'SESSION COST', value: `$${stats.session_cost}`, color: t.textSecondary },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-4 text-center" data-testid={`stat-${s.label.toLowerCase().replace(' ', '-')}`}>
                <span className="font-data text-[9px] tracking-widest block" style={{ color: t.textMuted }}>{s.label}</span>
                <span className="font-display text-2xl block mt-1" style={{ color: s.color }}>{s.value}</span>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          {[
            { id: 'genres', label: 'GENRE EXPLORER', desc: '50 sub-genres across 4 phases', icon: '\u27D0' },
            { id: 'history', label: 'THE VAULT', desc: 'Your generated track history', icon: '\u25C8' },
            { id: 'settings', label: 'SETTINGS', desc: 'Skins, hardware sync, alerts', icon: '\u27E1' },
          ].map((nav) => (
            <motion.button
              key={nav.id}
              data-testid={`nav-${nav.id}`}
              className="glass-card rounded-xl p-6 text-left"
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(nav.id)}
            >
              <span className="font-display text-2xl block mb-2" style={{ color: t.accent }}>{nav.icon}</span>
              <span className="font-ui text-xs font-bold tracking-wider block" style={{ color: t.text }}>{nav.label}</span>
              <span className="font-editorial text-xs block mt-1" style={{ color: t.textMuted }}>{nav.desc}</span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
