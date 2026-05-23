import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SKINS, PHASE_COLORS } from '../data/constants';
import { useTheme } from '../hooks/useTheme';

const PHASE_SKIN_MAP = {
  1: 'obsidian',
  2: 'original',
  3: 'glass',
  4: 'paper',
};

const PHASE_SKIN_LABELS = {
  1: { phase: 'P1 PEAK-BASS', skin: 'Obsidian Matte', why: 'Dark crimson intensity' },
  2: { phase: 'P2 MAIN-FLOOR', skin: 'Original Juke', why: 'Cyber magenta/cyan' },
  3: { phase: 'P3 SUNRISE', skin: 'Glass', why: 'Frosted ethereal dawn' },
  4: { phase: 'P4 ZONED-OUT', skin: 'Paper', why: 'Parchment calm' },
};

export default function Settings({ activeSkin, setActiveSkin, autoSkin, setAutoSkin, onBack }) {
  const t = useTheme();
  const [costAlert, setCostAlert] = useState(5.00);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [highContrast, setHighContrast] = useState(false);

  return (
    <div data-testid="settings-page" className="min-h-screen px-6 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button data-testid="settings-back-btn" className="font-data text-[10px] tracking-widest mb-2 block transition-colors hover:opacity-80" style={{ color: t.textMuted }} onClick={onBack}>
            &larr; BACK
          </button>
          <h1 className="font-display text-4xl tracking-tighter" style={{ color: t.text }}>SETTINGS</h1>
          <p className="font-data text-[10px] tracking-widest mt-1" style={{ color: t.textMuted }}>HARDWARE SYNC & PREFERENCES</p>
        </div>

        {/* Auto-Skin Section */}
        <motion.div className="glass-card rounded-xl p-6 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl tracking-tight" style={{ color: t.text }}>PHASE-REACTIVE SKIN</h2>
              <p className="font-data text-[9px] mt-1" style={{ color: t.textMuted }}>
                The app morphs its aesthetic to match the energy phase
              </p>
            </div>
            <button
              data-testid="toggle-auto-skin"
              className="w-14 h-7 rounded-full relative transition-colors"
              style={{ background: autoSkin ? t.accent : t.border }}
              onClick={() => setAutoSkin(!autoSkin)}
            >
              <motion.div
                className="w-6 h-6 rounded-full absolute top-0.5"
                style={{ background: autoSkin ? t.bg : t.textSecondary }}
                animate={{ left: autoSkin ? 30 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Phase-skin mapping preview */}
          <motion.div
            animate={{ opacity: autoSkin ? 1 : 0.4, height: autoSkin ? 'auto' : 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(phase => {
                const pc = PHASE_COLORS[phase];
                const skinKey = PHASE_SKIN_MAP[phase];
                const skin = SKINS[skinKey];
                const info = PHASE_SKIN_LABELS[phase];
                const isCurrentPhase = t.phaseCode === phase;

                return (
                  <motion.div
                    key={phase}
                    data-testid={`auto-skin-preview-${phase}`}
                    className="rounded-xl p-3 relative overflow-hidden"
                    style={{
                      background: skin.bg,
                      border: `1px solid ${isCurrentPhase && autoSkin ? pc.accent : skin.border}`,
                      boxShadow: isCurrentPhase && autoSkin ? `0 0 16px ${pc.glow}` : 'none',
                    }}
                    animate={isCurrentPhase && autoSkin ? { scale: [1, 1.02, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {/* Phase dot */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: pc.accent, boxShadow: `0 0 4px ${pc.accent}` }} />
                      <span className="font-display text-xs" style={{ color: pc.accent }}>{info.phase.split(' ')[0]}</span>
                    </div>
                    {/* Skin color preview */}
                    <div className="flex gap-1 mb-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: skin.accent1 }} />
                      <div className="w-3 h-3 rounded-full" style={{ background: skin.accent2 }} />
                    </div>
                    <span className="font-data text-[7px] tracking-wider block" style={{ color: skin.text }}>
                      {info.skin.toUpperCase()}
                    </span>
                    <span className="font-data text-[6px] block mt-0.5" style={{ color: skin.textSecondary || skin.text + '80' }}>
                      {info.why}
                    </span>

                    {/* Active indicator */}
                    {isCurrentPhase && autoSkin && (
                      <motion.div
                        className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                        style={{ background: pc.accent }}
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
            {autoSkin && (
              <p className="font-data text-[8px] mt-3 text-center" style={{ color: t.accent }}>
                ACTIVE — Skin will auto-switch when you change phase
              </p>
            )}
            {!autoSkin && (
              <p className="font-data text-[8px] mt-3 text-center" style={{ color: t.textMuted }}>
                Enable to let the app adapt its visual identity to each energy phase
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Manual Skin Switcher */}
        <motion.div className="glass-card rounded-xl p-6 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl tracking-tight" style={{ color: t.text }}>VISUAL SKINS</h2>
            {autoSkin && (
              <span className="font-data text-[8px] tracking-wider px-2 py-1 rounded-full" style={{ background: `${t.accent}15`, color: t.accent }}>
                AUTO MODE — tap a skin to override
              </span>
            )}
          </div>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(SKINS).map(([key, skin]) => {
              const isActive = activeSkin === key;
              return (
                <motion.button
                  key={key}
                  data-testid={`skin-${key}`}
                  className="rounded-xl p-3 text-center relative overflow-hidden"
                  style={{
                    background: skin.bg,
                    border: `2px solid ${isActive ? skin.accent1 : skin.border}`,
                    boxShadow: isActive ? `0 0 20px ${skin.accent1}40` : 'none',
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveSkin(key)}
                >
                  <div className="flex gap-1 justify-center mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: skin.accent1 }} />
                    <div className="w-2 h-2 rounded-full" style={{ background: skin.accent2 }} />
                  </div>
                  <span className="font-data text-[8px] tracking-wider block" style={{ color: skin.text }}>
                    {skin.name.toUpperCase()}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <p className="font-data text-[9px] mt-3" style={{ color: t.textMuted }}>
            ACTIVE: {SKINS[activeSkin]?.name.toUpperCase()}
            {autoSkin ? ' (auto-selected)' : ''}
          </p>
        </motion.div>

        {/* Cost Alerts */}
        <motion.div className="glass-card rounded-xl p-6 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="font-display text-xl tracking-tight mb-4" style={{ color: t.text }}>COST ALERTS</h2>
          <div className="flex items-center justify-between mb-3">
            <span className="font-ui text-sm" style={{ color: t.textSecondary }}>Session spend ceiling</span>
            <span className="font-data text-sm" style={{ color: t.accent }}>${costAlert.toFixed(2)}</span>
          </div>
          <input
            data-testid="cost-alert-slider"
            type="range" min="1" max="50" step="0.5" value={costAlert}
            onChange={(e) => setCostAlert(Number(e.target.value))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(90deg, ${t.accent} ${((costAlert - 1) / 49) * 100}%, ${t.border} ${((costAlert - 1) / 49) * 100}%)` }}
          />
          <div className="flex justify-between mt-1">
            <span className="font-data text-[9px]" style={{ color: t.textMuted }}>$1.00</span>
            <span className="font-data text-[9px]" style={{ color: t.textMuted }}>$50.00</span>
          </div>
        </motion.div>

        {/* Hardware Sync */}
        <motion.div className="glass-card rounded-xl p-6 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-display text-xl tracking-tight mb-4" style={{ color: t.text }}>HARDWARE SYNC</h2>
          <div className="space-y-4">
            {[
              { label: 'Pioneer CDJ-3000', status: 'Not connected' },
              { label: 'Allen & Heath Xone:96', status: 'Not connected' },
              { label: 'Smart Lighting (RGB)', status: 'Not connected' },
            ].map((hw) => (
              <div key={hw.label} className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${t.border}` }}>
                <div>
                  <span className="font-ui text-sm block" style={{ color: t.text }}>{hw.label}</span>
                  <span className="font-data text-[10px]" style={{ color: t.textMuted }}>{hw.status}</span>
                </div>
                <button className="font-data text-[10px] tracking-wider px-3 py-1.5 rounded-full border transition-all" style={{ borderColor: t.border, color: t.textMuted }}>
                  SCAN
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Accessibility */}
        <motion.div className="glass-card rounded-xl p-6 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="font-display text-xl tracking-tight mb-4" style={{ color: t.text }}>ACCESSIBILITY</h2>
          <div className="space-y-4">
            {[
              { label: 'Reduce Motion', value: reducedMotion, onChange: setReducedMotion },
              { label: 'Haptic Feedback', value: hapticsEnabled, onChange: setHapticsEnabled },
              { label: 'High Contrast Mode', value: highContrast, onChange: setHighContrast },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between">
                <span className="font-ui text-sm" style={{ color: t.textSecondary }}>{setting.label}</span>
                <button
                  data-testid={`toggle-${setting.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className="w-12 h-6 rounded-full relative transition-colors"
                  style={{ background: setting.value ? t.accent : t.border }}
                  onClick={() => setting.onChange(!setting.value)}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full absolute top-0.5"
                    style={{ background: setting.value ? t.bg : t.textSecondary }}
                    animate={{ left: setting.value ? 26 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* About */}
        <motion.div className="glass-card rounded-xl p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="font-display text-xl tracking-tight mb-4" style={{ color: t.text }}>ABOUT</h2>
          <div className="space-y-2">
            {[
              { l: 'Version', v: '1.0.0 — London Legend Edition' },
              { l: 'AI Engine', v: 'Producer.ai / Lyria 3' },
              { l: 'Audio', v: 'Web Audio API Synthesizer' },
              { l: 'Design Standard', v: 'Apple HIG 2026' },
              { l: 'Principal Architect', v: 'Jonathan Blackburn' },
            ].map(r => (
              <div key={r.l} className="flex justify-between">
                <span className="font-ui text-sm" style={{ color: t.textMuted }}>{r.l}</span>
                <span className="font-data text-sm" style={{ color: t.textSecondary }}>{r.v}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
