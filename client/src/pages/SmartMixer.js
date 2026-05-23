import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PHASE_COLORS } from '../data/constants';
import { useTheme } from '../hooks/useTheme';
import { useApi } from '../hooks/useApi';
import { getEngine } from '../audio/engine';
import Visualizer from '../components/Visualizer';

const PHASE_META = {
  1: { label: 'PEAK-BASS', sub: 'Warehouse Techno', icon: '01' },
  2: { label: 'MAIN-FLOOR', sub: 'Groove & Flow', icon: '02' },
  3: { label: 'SUNRISE', sub: 'The Transition', icon: '03' },
  4: { label: 'ZONED-OUT', sub: 'Chilled After-Party', icon: '04' },
};

const PHASE_BPM = { 1: 160, 2: 128, 3: 115, 4: 80 };
const HOVER_LIFT = { y: -2 };
const TAP_SHRINK = { scale: 0.98 };
const TAP_SMALL = { scale: 0.95 };

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpColor(hex1, hex2, t) {
  const r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
  const r = Math.round(lerp(r1, r2, t)), g = Math.round(lerp(g1, g2, t)), b = Math.round(lerp(b1, b2, t));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// --- Transition waveform ---
function TransitionWaveform({ waveform, fromAccent, toAccent }) {
  if (!waveform) return null;
  const len = waveform.length;
  return (
    <div className="mt-3 h-8">
      <svg width="100%" height="100%" viewBox="0 0 200 32">
        {waveform.map((v, i) => {
          const barColor = lerpColor(fromAccent, toAccent, i / len);
          return (
            <rect key={`tw-${i}`} x={i * (200 / len)} y={32 - v * 28}
              width={Math.max(1, 200 / len - 1)} height={v * 28}
              fill={barColor} opacity="0.7" rx="0.5" />
          );
        })}
      </svg>
    </div>
  );
}

// --- Phase picker card ---
function PhaseCard({ phase, pct, onSelect, theme: t, isCurrent }) {
  const pc = PHASE_COLORS[phase];
  const meta = PHASE_META[phase];
  const [open, setOpen] = useState(false);

  return (
    <div>
      <motion.div
        className="glass-card rounded-xl p-4 relative overflow-hidden cursor-pointer"
        style={{
          borderColor: pct > 0.3 ? pc.accent + '40' : t.border,
          boxShadow: pct > 0.3 ? `0 0 ${Math.round(pct * 20)}px ${pc.glow}` : 'none',
        }}
        onClick={() => setOpen(v => !v)}
        whileHover={HOVER_LIFT}
      >
        <div className="absolute bottom-0 left-0 right-0 h-1" style={{
          background: `linear-gradient(90deg, ${pc.accent}${Math.round(pct * 99).toString(16).padStart(2,'0')}, transparent)`,
        }} />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `${pc.accent}15`, border: `1px solid ${pc.accent}30` }}>
            <span className="font-display text-sm" style={{ color: pc.accent }}>{meta.icon}</span>
          </div>
          <div className="min-w-0">
            <span className="font-display text-sm block" style={{ color: pc.accent }}>{meta.label}</span>
            <span className="font-data text-[9px]" style={{ color: t.textMuted }}>{meta.sub}</span>
          </div>
          <div className="ml-auto">
            <span className="font-display text-lg" style={{ color: pc.accent, opacity: 0.4 + pct * 0.6 }}>
              {Math.round(pct * 100)}%
            </span>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {open && (
          <motion.div className="mt-2 grid grid-cols-4 gap-2" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            {[1, 2, 3, 4].map(p => {
              const c = PHASE_COLORS[p];
              const isActive = p === phase;
              return (
                <motion.button key={`pick-${p}`} data-testid={`mixer-${isCurrent ? 'from' : 'to'}-phase-${p}`}
                  className="rounded-lg p-2 text-center"
                  style={{ background: isActive ? `${c.accent}15` : 'transparent', border: `1px solid ${isActive ? c.accent : t.border}` }}
                  whileHover={{ scale: 1.05 }} whileTap={TAP_SMALL}
                  onClick={(e) => { e.stopPropagation(); onSelect(p); setOpen(false); }}>
                  <span className="font-display text-xs block" style={{ color: isActive ? c.accent : t.textMuted }}>P{p}</span>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Crossfade slider ---
function CrossfadeSlider({ crossfade, setCrossfade, blendedAccent, fromC, toC, autoFading }) {
  return (
    <div className="relative h-12 rounded-xl overflow-hidden" style={{ border: `1px solid var(--skin-border)` }}>
      <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${fromC.accent}30 0%, ${blendedAccent}20 ${crossfade}%, ${toC.accent}30 100%)` }} />
      <div className="absolute inset-y-0 left-0" style={{ width: `${crossfade}%`, background: `linear-gradient(90deg, ${fromC.accent}40, ${toC.accent}60)`, transition: autoFading ? 'none' : 'width 0.1s ease' }} />
      <input data-testid="crossfade-slider" type="range" min="0" max="100" value={crossfade}
        onChange={(e) => setCrossfade(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing z-10" />
      <motion.div className="absolute top-1 bottom-1 w-1.5 rounded-full"
        style={{ left: `calc(${crossfade}% - 3px)`, background: blendedAccent, boxShadow: `0 0 12px ${blendedAccent}80` }}
        animate={{ scaleY: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="font-display text-lg" style={{ color: blendedAccent, textShadow: `0 0 20px ${blendedAccent}` }}>{Math.round(crossfade)}%</span>
      </div>
    </div>
  );
}

// --- Main component ---
export default function SmartMixer({ activePhase, setActivePhase, onBack, currentTrack, setCurrentTrack }) {
  const t = useTheme();
  const { post } = useApi();
  const [fromPhase, setFromPhase] = useState(activePhase);
  const [toPhase, setToPhase] = useState(activePhase < 4 ? activePhase + 1 : 1);
  const [crossfade, setCrossfade] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionTrack, setTransitionTrack] = useState(null);
  const [autoFading, setAutoFading] = useState(false);
  const autoFadeRef = useRef(null);
  const engineRef = useRef(null);

  const pct = crossfade / 100;
  const fromC = PHASE_COLORS[fromPhase];
  const toC = PHASE_COLORS[toPhase];
  const blendedAccent = useMemo(() => lerpColor(fromC.accent, toC.accent, pct), [fromC.accent, toC.accent, pct]);
  const blendedBpm = Math.round(lerp(PHASE_BPM[fromPhase] || 128, PHASE_BPM[toPhase] || 128, pct));

  // Init engine
  useEffect(() => { engineRef.current = getEngine(); return () => { engineRef.current?.stop(); }; }, []);

  // Sync crossfade to audio
  useEffect(() => {
    engineRef.current?.setCrossfade(fromPhase, toPhase, pct);
    engineRef.current?.setBpm(blendedBpm);
  }, [fromPhase, toPhase, pct, blendedBpm]);

  // Play/pause
  useEffect(() => {
    if (isPlaying) { engineRef.current?.play(); } else { engineRef.current?.stop(); }
  }, [isPlaying]);

  // Cleanup auto-fade on unmount
  useEffect(() => () => { if (autoFadeRef.current) clearInterval(autoFadeRef.current); }, []);

  const startAutoFade = useCallback(() => {
    if (autoFading) {
      if (autoFadeRef.current) clearInterval(autoFadeRef.current);
      setAutoFading(false);
      return;
    }
    setAutoFading(true);
    setCrossfade(0);
    setIsPlaying(true);
    let val = 0;
    autoFadeRef.current = setInterval(() => {
      val += 0.5;
      if (val >= 100) { val = 100; clearInterval(autoFadeRef.current); setAutoFading(false); }
      setCrossfade(val);
    }, 80);
  }, [autoFading]);

  const handleTransition = useCallback(async () => {
    setTransitioning(true);
    try {
      const track = await post('/api/transition', { from_phase: fromPhase, to_phase: toPhase, crossfade_pct: crossfade, atmosphere: 'balanced' });
      setTransitionTrack(track);
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (_) { /* transition error */ }
    finally { setTransitioning(false); }
  }, [fromPhase, toPhase, crossfade, post, setCurrentTrack]);

  const commitTransition = useCallback(() => {
    setActivePhase(toPhase);
    setCrossfade(0);
    setFromPhase(toPhase);
    setToPhase(toPhase < 4 ? toPhase + 1 : 1);
  }, [toPhase, setActivePhase]);

  return (
    <div data-testid="smart-mixer-page" className="min-h-screen px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button data-testid="mixer-back-btn" className="font-data text-[10px] tracking-widest transition-colors hover:opacity-80" style={{ color: t.textMuted }} onClick={onBack}>&larr; DASHBOARD</button>
          <span className="font-data text-[10px] tracking-widest" style={{ color: blendedAccent }}>SMART MIXER</span>
        </div>

        <div className="hardware-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(90deg, ${fromC.accent}08 0%, ${blendedAccent}12 50%, ${toC.accent}08 100%)` }} />
          <div className="relative z-10">
            {/* Phase panels */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div data-testid="mixer-from-panel">
                <span className="font-data text-[9px] tracking-widest block mb-3" style={{ color: t.textMuted }}>CURRENT PHASE</span>
                <PhaseCard phase={fromPhase} pct={1 - pct} onSelect={setFromPhase} theme={t} isCurrent />
              </div>
              <div data-testid="mixer-to-panel">
                <span className="font-data text-[9px] tracking-widest block mb-3" style={{ color: t.textMuted }}>TARGET PHASE</span>
                <PhaseCard phase={toPhase} pct={pct} onSelect={setToPhase} theme={t} />
              </div>
            </div>

            {/* Crossfade */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="font-display text-sm" style={{ color: fromC.accent, opacity: 1 - pct * 0.6 }}>P{fromPhase}</span>
                <span className="font-data text-[9px] tracking-widest" style={{ color: t.textMuted }}>CROSS-FADE</span>
                <span className="font-display text-sm" style={{ color: toC.accent, opacity: 0.4 + pct * 0.6 }}>P{toPhase}</span>
              </div>
              <CrossfadeSlider crossfade={crossfade} setCrossfade={setCrossfade} blendedAccent={blendedAccent} fromC={fromC} toC={toC} autoFading={autoFading} />
              <div className="flex justify-between mt-2">
                <span className="font-data text-[9px]" style={{ color: t.textMuted }}>{PHASE_META[fromPhase]?.label}</span>
                <span className="font-data text-[10px]" style={{ color: blendedAccent }}>{blendedBpm} BPM</span>
                <span className="font-data text-[9px]" style={{ color: t.textMuted }}>{PHASE_META[toPhase]?.label}</span>
              </div>
            </div>

            {/* Visualizer */}
            <div className="h-28 mb-6 rounded-xl overflow-hidden relative" style={{ border: `1px solid ${t.border}` }}>
              <Visualizer phase={pct > 0.5 ? toPhase : fromPhase} isPlaying={isPlaying} bpm={blendedBpm} skinKey={t.skinKey} />
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${t.bg}80` }}>
                  <span className="font-display text-sm" style={{ color: t.textMuted }}>STANDBY</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mb-6">
              <motion.button data-testid="mixer-play-btn" className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${blendedAccent}30, ${blendedAccent}10)`, border: `2px solid ${blendedAccent}`, boxShadow: `0 0 16px ${blendedAccent}40` }}
                whileHover={{ scale: 1.05 }} whileTap={TAP_SMALL} onClick={() => setIsPlaying(v => !v)}>
                {isPlaying ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={blendedAccent}><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={blendedAccent}><path d="M8 5v14l11-7z"/></svg>
                )}
              </motion.button>
              <motion.button data-testid="auto-fade-btn" className="flex-1 py-3 rounded-xl font-ui font-bold text-sm tracking-wider"
                style={{ background: autoFading ? `${blendedAccent}25` : 'transparent', border: `1px solid ${autoFading ? blendedAccent : t.border}`, color: autoFading ? blendedAccent : t.textSecondary }}
                whileTap={TAP_SHRINK} onClick={startAutoFade}>
                {autoFading ? 'STOP AUTO-FADE' : 'AUTO-FADE'}
              </motion.button>
              <motion.button data-testid="generate-bridge-btn" className="flex-1 py-3 rounded-xl font-ui font-bold text-sm tracking-wider"
                style={{ background: `${blendedAccent}15`, border: `1px solid ${blendedAccent}40`, color: blendedAccent }}
                whileTap={TAP_SHRINK} onClick={handleTransition} disabled={transitioning}>
                {transitioning ? 'BRIDGING...' : 'GENERATE BRIDGE'}
              </motion.button>
            </div>

            {/* Commit */}
            <motion.button data-testid="commit-transition-btn" className="w-full py-3 rounded-xl font-ui font-bold text-sm tracking-wider"
              style={{ background: crossfade > 50 ? `${toC.accent}15` : 'transparent', border: `1px solid ${crossfade > 50 ? toC.accent + '60' : t.border}`, color: crossfade > 50 ? toC.accent : t.textMuted }}
              whileTap={TAP_SHRINK} onClick={commitTransition}>
              {crossfade > 50 ? `COMMIT TO PHASE ${toPhase} \u2014 ${PHASE_META[toPhase]?.label}` : 'DRAG CROSSFADE PAST 50% TO COMMIT'}
            </motion.button>

            {/* Transition track info */}
            <AnimatePresence>
              {transitionTrack && (
                <motion.div data-testid="transition-track-info" className="glass-card rounded-xl p-4 mt-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-data text-[9px] tracking-widest block" style={{ color: t.textMuted }}>TRANSITION BRIDGE</span>
                      <span className="font-ui text-sm font-semibold" style={{ color: blendedAccent }}>{transitionTrack.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-data text-[10px] block" style={{ color: t.textMuted }}>{transitionTrack.bpm} BPM</span>
                      <span className="font-data text-[9px]" style={{ color: t.textMuted }}>{transitionTrack.from_genre?.name} &rarr; {transitionTrack.to_genre?.name}</span>
                    </div>
                  </div>
                  <TransitionWaveform waveform={transitionTrack.waveform} fromAccent={fromC.accent} toAccent={toC.accent} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
