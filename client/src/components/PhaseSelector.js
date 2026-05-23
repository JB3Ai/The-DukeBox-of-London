import React from 'react';
import { motion } from 'framer-motion';
import { PHASE_COLORS } from '../data/constants';
import { useTheme } from '../hooks/useTheme';

export default function PhaseSelector({ activePhase, onSelect }) {
  const t = useTheme();
  const phases = [
    { code: 1, label: 'PEAK', sub: 'BASS', icon: '01' },
    { code: 2, label: 'MAIN', sub: 'FLOOR', icon: '02' },
    { code: 3, label: 'SUN', sub: 'RISE', icon: '03' },
    { code: 4, label: 'ZONED', sub: 'OUT', icon: '04' },
  ];

  return (
    <div data-testid="phase-selector" className="relative">
      <div className="relative w-72 h-72 mx-auto">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 300">
          <circle cx="150" cy="150" r="140" fill="none" stroke={t.border} strokeWidth="2" />
          {phases.map((p, i) => {
            const arcStart = (i * 90 - 135) * (Math.PI / 180);
            const arcEnd = ((i + 1) * 90 - 135) * (Math.PI / 180);
            const isActive = activePhase === p.code;
            const pc = PHASE_COLORS[p.code];
            // In skins with own accent, still show phase-specific colors on the ring
            const ringColor = isActive ? pc.accent : t.border;
            return (
              <g key={p.code}>
                <path
                  d={`M ${150 + 140 * Math.cos(arcStart)} ${150 + 140 * Math.sin(arcStart)} A 140 140 0 0 1 ${150 + 140 * Math.cos(arcEnd)} ${150 + 140 * Math.sin(arcEnd)}`}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth={isActive ? 4 : 2}
                  strokeLinecap="round"
                  style={{
                    filter: isActive ? `drop-shadow(0 0 8px ${pc.glow})` : 'none',
                    transition: 'all 0.4s ease',
                  }}
                />
              </g>
            );
          })}
        </svg>

        {phases.map((p, i) => {
          const angle = (i * 90) - 45;
          const rad = (angle * Math.PI) / 180;
          const x = 150 + 115 * Math.cos(rad);
          const y = 150 + 115 * Math.sin(rad);
          const isActive = activePhase === p.code;
          const pc = PHASE_COLORS[p.code];
          const btnAccent = isActive ? pc.accent : t.textMuted;

          return (
            <motion.button
              key={p.code}
              data-testid={`phase-btn-${p.code}`}
              className="absolute flex flex-col items-center justify-center rounded-full"
              style={{
                left: x - 32,
                top: y - 32,
                width: 64,
                height: 64,
                background: isActive ? `${pc.accent}15` : `${t.surface}CC`,
                border: `1px solid ${isActive ? pc.accent : t.border}`,
                boxShadow: isActive ? `0 0 20px ${pc.glow}` : 'none',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(p.code)}
            >
              <span className="font-display text-lg leading-none" style={{ color: btnAccent }}>{p.icon}</span>
              <span className="font-data text-[8px] tracking-widest mt-0.5" style={{ color: btnAccent }}>{p.label}</span>
            </motion.button>
          );
        })}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            className="w-32 h-32 rounded-full flex flex-col items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${t.accent}08 0%, transparent 70%)`,
              border: `1px solid ${t.accent}30`,
            }}
            animate={{
              boxShadow: [`0 0 20px ${t.glow}`, `0 0 40px ${t.glow}`, `0 0 20px ${t.glow}`],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="font-display text-3xl" style={{ color: t.accent }}>
              {String(activePhase).padStart(2, '0')}
            </span>
            <span className="font-data text-[9px] tracking-widest mt-1" style={{ color: t.textMuted }}>
              {t.phaseName}
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
