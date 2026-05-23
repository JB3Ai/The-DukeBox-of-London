import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Visualizer from '../components/Visualizer';
import Knob from '../components/Knob';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../hooks/useTheme';
import { getEngine } from '../audio/engine';

// --- Extracted sub-components ---

function AudioStatusPill({ isPlaying, audioReady, theme: t }) {
  return (
    <div data-testid="audio-status" className="glass-card rounded-full px-3 py-1 flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: isPlaying && audioReady ? '#00FF41' : t.textMuted, boxShadow: isPlaying && audioReady ? '0 0 6px #00FF41' : 'none' }} />
      <span className="font-data text-[9px]" style={{ color: t.textMuted }}>{isPlaying && audioReady ? 'AUDIO LIVE' : 'SILENT'}</span>
    </div>
  );
}

function CostPill({ sessionCost, theme: t }) {
  return (
    <div data-testid="cost-monitor" className="glass-card rounded-full px-4 py-1.5 flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
      <span className="font-data text-[10px]" style={{ color: t.textSecondary }}>${sessionCost.toFixed(4)}/session</span>
    </div>
  );
}

function TechnicalReadout({ track, theme: t }) {
  if (!track) return null;
  const items = [
    { label: 'BPM', value: track.bpm },
    { label: 'PHASE', value: `P${track.phase}` },
    { label: 'ATMO', value: track.atmosphere?.toUpperCase() },
    { label: 'TIER', value: track.processing_tier?.toUpperCase() },
    { label: 'COST/HR', value: `$${track.cost_per_hour}` },
    { label: 'DURATION', value: `${Math.floor(track.duration_s / 60)}:${String(track.duration_s % 60).padStart(2, '0')}` },
    { label: 'SEED', value: track.seed?.random_state },
    { label: 'ID', value: track.track_id },
  ];
  return (
    <motion.div data-testid="technical-readout" className="glass-card rounded-xl p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <span className="font-data text-[9px] block" style={{ color: t.textMuted }}>{item.label}</span>
          <span className="font-data text-xs" style={{ color: t.text }}>{item.value}</span>
        </div>
      ))}
    </motion.div>
  );
}

function ConductorControls({ atmosphere, setAtmosphere, bpm, setBpm, onConduct, onSurprise, conducting, theme: t }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-data text-[10px] tracking-widest" style={{ color: t.textMuted }}>AI CONDUCTOR</span>
      </div>
      <div className="flex gap-2 mb-4">
        {['dark', 'balanced', 'uplifting'].map(a => (
          <button key={a} data-testid={`atmosphere-${a}`} className="font-data text-[10px] tracking-wider px-4 py-2 rounded-full border transition-all flex-1"
            style={{ borderColor: atmosphere === a ? t.accent : t.border, color: atmosphere === a ? t.accent : t.textMuted, background: atmosphere === a ? `${t.accent}10` : 'transparent' }}
            onClick={() => setAtmosphere(a)}>{a.toUpperCase()}</button>
        ))}
      </div>
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="font-data text-[9px]" style={{ color: t.textMuted }}>VELOCITY</span>
          <span className="font-data text-[10px]" style={{ color: t.accent }}>{bpm} BPM</span>
        </div>
        <input data-testid="bpm-slider" type="range" min="60" max="180" value={bpm} onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full h-1 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(90deg, ${t.accent} ${((bpm - 60) / 120) * 100}%, ${t.border} ${((bpm - 60) / 120) * 100}%)` }}
        />
        <div className="flex justify-between mt-1">
          <span className="font-data text-[9px]" style={{ color: t.textMuted }}>60</span>
          <span className="font-data text-[9px]" style={{ color: t.textMuted }}>180</span>
        </div>
      </div>
      <div className="flex gap-3">
        <motion.button data-testid="conduct-now-btn" className="flex-1 py-3 rounded-xl font-ui font-bold text-sm tracking-wider"
          style={{ background: `${t.accent}15`, border: `1px solid ${t.accent}40`, color: t.accent }}
          whileHover={{ boxShadow: `0 0 20px ${t.glow}` }} whileTap={{ scale: 0.98 }} onClick={onConduct} disabled={conducting}>
          {conducting ? 'RENDERING...' : 'CONDUCT'}
        </motion.button>
        <motion.button data-testid="surprise-me-btn" className="px-6 py-3 rounded-xl font-ui font-bold text-sm tracking-wider border transition-all"
          style={{ borderColor: t.border, color: t.textSecondary }} whileTap={{ scale: 0.98 }} onClick={onSurprise} disabled={conducting}>
          SURPRISE ME
        </motion.button>
      </div>
    </div>
  );
}

function RackEQ({ theme: t, isPlaying }) {
  const [eqBands, setEqBands] = useState(Array(10).fill(30));
  useEffect(() => {
    if (!isPlaying) return;
    const iv = setInterval(() => {
      const data = getEngine().getAnalyserData();
      if (data.length === 0) return;
      const bandSize = Math.floor(data.length / 10);
      const newBands = [];
      for (let i = 0; i < 10; i++) { let sum = 0; for (let j = 0; j < bandSize; j++) sum += data[i * bandSize + j]; newBands.push((sum / bandSize / 255) * 100); }
      setEqBands(newBands);
    }, 60);
    return () => clearInterval(iv);
  }, [isPlaying]);

  const freqs = ['32', '64', '125', '250', '500', '1K', '2K', '4K', '8K', '16K'];
  return (
    <div className="mb-6">
      <span className="font-data text-[9px] tracking-widest block mb-3" style={{ color: t.textMuted }}>10-BAND GRAPHIC EQ — LIVE</span>
      <div className="flex items-end gap-2 h-24">
        {freqs.map((freq, i) => (
          <div key={freq} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full relative h-full flex items-end">
              <motion.div className="w-full rounded-sm" animate={{ height: `${Math.max(5, eqBands[i])}%` }} transition={{ duration: 0.08 }}
                style={{ background: `linear-gradient(180deg, ${t.accent}90, ${t.accent}20)` }} />
            </div>
            <span className="font-data text-[7px]" style={{ color: t.textMuted }}>{freq}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RackStems({ theme: t, isPlaying }) {
  const [stems, setStems] = useState({ DRUMS: 50, BASS: 50, VOCAL: 30, LEAD: 40 });
  useEffect(() => {
    if (!isPlaying) return;
    const iv = setInterval(() => {
      const data = getEngine().getAnalyserData();
      if (data.length === 0) return;
      const len = data.length;
      const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length / 255 * 100;
      setStems({
        DRUMS: avg(data.slice(0, Math.floor(len * 0.1))),
        BASS: avg(data.slice(Math.floor(len * 0.05), Math.floor(len * 0.15))),
        VOCAL: avg(data.slice(Math.floor(len * 0.3), Math.floor(len * 0.6))),
        LEAD: avg(data.slice(Math.floor(len * 0.5), Math.floor(len * 0.9))),
      });
    }, 80);
    return () => clearInterval(iv);
  }, [isPlaying]);

  return (
    <div className="mb-4">
      <span className="font-data text-[9px] tracking-widest block mb-3" style={{ color: t.textMuted }}>STEM SPLITTER — LIVE</span>
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(stems).map(([stem, level]) => (
          <div key={stem} className="text-center">
            <div className="h-16 w-full rounded-lg relative overflow-hidden mb-1" style={{ border: `1px solid ${t.border}` }}>
              <motion.div className="absolute bottom-0 w-full" animate={{ height: `${Math.max(5, level)}%` }} transition={{ duration: 0.1 }}
                style={{ background: `linear-gradient(180deg, ${t.accent}60, transparent)` }} />
            </div>
            <span className="font-data text-[8px]" style={{ color: t.textMuted }}>{stem}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProStudioRack({ theme: t, isPlaying, showRack }) {
  return (
    <AnimatePresence>
      {showRack && (
        <motion.div data-testid="pro-studio-rack" className="mt-4 glass-card rounded-xl p-6"
          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-display text-lg" style={{ color: t.accent }}>PRO STUDIO RACK</span>
            <span className="font-data text-[9px]" style={{ color: isPlaying ? '#00FF41' : t.textMuted }}>{isPlaying ? 'ACTIVE' : 'STANDBY'}</span>
          </div>
          <RackEQ theme={t} isPlaying={isPlaying} />
          <RackStems theme={t} isPlaying={isPlaying} />
          <div className="flex justify-between pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
            {[
              { label: 'BUFFER', value: isPlaying ? 'HEALTHY' : 'IDLE' },
              { label: 'LATENCY', value: isPlaying ? '12ms' : '--' },
              { label: 'ENGINE', value: 'WEB AUDIO' },
              { label: 'SYNTH', value: isPlaying ? 'ACTIVE' : 'OFF' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <span className="font-data text-[8px] block" style={{ color: t.textMuted }}>{s.label}</span>
                <span className="font-data text-[10px]" style={{ color: t.textSecondary }}>{s.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Main component ---

export default function NowPlaying({ activePhase, currentTrack, setCurrentTrack, onBack, onShare }) {
  const { post } = useApi();
  const t = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [bass, setBass] = useState(60);
  const [treble, setTreble] = useState(50);
  const [showRack, setShowRack] = useState(false);
  const [showReadout, setShowReadout] = useState(false);
  const [atmosphere, setAtmosphere] = useState('balanced');
  const [bpm, setBpm] = useState(128);
  const [conducting, setConducting] = useState(false);
  const [sessionCost, setSessionCost] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [volume, setVolume] = useState(70);
  const engineRef = useRef(null);

  // Engine lifecycle
  useEffect(() => { engineRef.current = getEngine(); return () => { engineRef.current?.stop(); }; }, []);

  // Sync params to engine
  useEffect(() => { engineRef.current?.setPhase(activePhase); }, [activePhase]);
  useEffect(() => { engineRef.current?.setAtmosphere(atmosphere); }, [atmosphere]);
  useEffect(() => { engineRef.current?.setBpm(bpm); }, [bpm]);
  useEffect(() => { engineRef.current?.setBass(bass); }, [bass]);
  useEffect(() => { engineRef.current?.setTreble(treble); }, [treble]);
  useEffect(() => { engineRef.current?.setVolume(volume / 100); }, [volume]);

  // Play/pause engine
  useEffect(() => {
    if (isPlaying) { engineRef.current?.play().then(() => setAudioReady(true)); }
    else { engineRef.current?.stop(); }
  }, [isPlaying]);

  // Auto-conduct on mount
  useEffect(() => {
    if (!currentTrack) { handleConduct(); } else { setIsPlaying(true); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleConduct = useCallback(async () => {
    setConducting(true);
    try {
      const track = await post('/api/conduct', { phase: activePhase, atmosphere, bpm, surprise_me: false });
      setCurrentTrack(track);
      setIsPlaying(true);
      setBpm(track.bpm);
    } catch (_) { /* conductor error */ }
    finally { setConducting(false); }
  }, [activePhase, atmosphere, bpm, post, setCurrentTrack]);

  const handleSurprise = useCallback(async () => {
    setConducting(true);
    try {
      const track = await post('/api/conduct', { phase: activePhase, surprise_me: true });
      setCurrentTrack(track);
      setIsPlaying(true);
      setBpm(track.bpm);
    } catch (_) { /* conductor error */ }
    finally { setConducting(false); }
  }, [activePhase, post, setCurrentTrack]);

  // Session cost ticker
  useEffect(() => { if (!isPlaying) return; const iv = setInterval(() => setSessionCost(p => p + 0.02 / 3600), 1000); return () => clearInterval(iv); }, [isPlaying]);

  return (
    <div data-testid="now-playing-page" className="min-h-screen px-4 py-6">
      {conducting && (
        <motion.div className="shimmer-edge" style={{ background: `linear-gradient(90deg, transparent, ${t.accent}, transparent)` }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      )}
      <div className="max-w-4xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button data-testid="now-playing-back-btn" className="font-data text-[10px] tracking-widest transition-colors hover:opacity-80" style={{ color: t.textMuted }} onClick={onBack}>&larr; DASHBOARD</button>
          <div className="flex items-center gap-4">
            <AudioStatusPill isPlaying={isPlaying} audioReady={audioReady} theme={t} />
            <CostPill sessionCost={sessionCost} theme={t} />
            {currentTrack && (
              <button
                data-testid="now-playing-share-btn"
                className="font-data text-[9px] tracking-wider px-3 py-1.5 rounded-full border transition-all hover:opacity-80"
                style={{ borderColor: t.border, color: t.textMuted }}
                onClick={() => onShare?.(currentTrack)}
              >
                SHARE
              </button>
            )}
            <span className="font-data text-[10px] tracking-widest" style={{ color: t.accent }}>P{activePhase} {t.phaseName}</span>
          </div>
        </div>

        <div className="hardware-panel rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
            <div className="w-full h-1 bg-white/20" style={{ animation: 'scanline 4s linear infinite' }} />
          </div>

          {/* Track info */}
          <motion.div className="text-center mb-6" onClick={() => setShowReadout(v => !v)} style={{ cursor: 'pointer' }}>
            {currentTrack ? (
              <>
                <motion.h2 className="font-display text-2xl md:text-3xl tracking-tighter" style={{ color: t.accent }} key={currentTrack.track_id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>{currentTrack.name}</motion.h2>
                <p className="font-data text-[10px] mt-1" style={{ color: t.textMuted }}>{currentTrack.genre?.name} — TAP FOR READOUT</p>
              </>
            ) : (
              <div>
                <h2 className="font-display text-2xl" style={{ color: t.textMuted }}>THE FLOOR IS QUIET</h2>
                <p className="font-editorial text-sm mt-1" style={{ color: t.textMuted }}>Tap Conduct to begin.</p>
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {showReadout && currentTrack && <TechnicalReadout track={currentTrack} theme={t} />}
          </AnimatePresence>

          {/* Visualizer */}
          <div className="h-40 md:h-52 mb-6 rounded-xl overflow-hidden relative" style={{ border: `1px solid ${t.border}` }}>
            <Visualizer phase={activePhase} isPlaying={isPlaying} bpm={bpm} skinKey={t.skinKey} />
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: `${t.bg}80` }}>
                <span className="font-display text-lg" style={{ color: t.textMuted }}>PAUSED</span>
              </div>
            )}
          </div>

          {/* Knobs + Transport */}
          <div className="flex items-center justify-between gap-4 md:gap-8 mb-6">
            <Knob label="BASS" value={bass} onChange={setBass} size={70} color={t.accent} testId="bass-knob" />
            <div className="flex items-center gap-3 md:gap-4">
              <motion.button data-testid="skip-prev-btn" className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: `1px solid ${t.border}` }} whileTap={{ scale: 0.9 }} onClick={handleConduct}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={t.text}><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
              </motion.button>
              <motion.button data-testid="play-pause-btn" className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${t.accent}30, ${t.accent}10)`, border: `2px solid ${t.accent}`, boxShadow: `0 0 20px ${t.glow}` }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsPlaying(v => !v)}>
                {isPlaying ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={t.accent}><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={t.accent}><path d="M8 5v14l11-7z"/></svg>
                )}
              </motion.button>
              <motion.button data-testid="skip-next-btn" className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: `1px solid ${t.border}` }} whileTap={{ scale: 0.9 }} onClick={handleSurprise}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={t.text}><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
              </motion.button>
            </div>
            <Knob label="TREBLE" value={treble} onChange={setTreble} size={70} color={t.accent} testId="treble-knob" />
          </div>

          {/* Volume */}
          <div className="mb-6 px-2">
            <div className="flex justify-between mb-1">
              <span className="font-data text-[9px]" style={{ color: t.textMuted }}>MASTER VOLUME</span>
              <span className="font-data text-[10px]" style={{ color: t.accent }}>{volume}%</span>
            </div>
            <input data-testid="volume-slider" type="range" min="0" max="100" value={volume} onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer"
              style={{ background: `linear-gradient(90deg, ${t.accent} ${volume}%, ${t.border} ${volume}%)` }}
            />
          </div>

          {/* Rack toggle */}
          <div className="flex justify-end mb-2">
            <button data-testid="toggle-rack-btn" className="font-data text-[10px] tracking-wider px-3 py-1 rounded-full border transition-all" style={{ borderColor: t.border, color: t.textMuted }} onClick={() => setShowRack(v => !v)}>
              {showRack ? 'CLOSE RACK' : 'OPEN RACK'}
            </button>
          </div>

          {/* Conductor */}
          <ConductorControls atmosphere={atmosphere} setAtmosphere={setAtmosphere} bpm={bpm} setBpm={setBpm} onConduct={handleConduct} onSurprise={handleSurprise} conducting={conducting} theme={t} />

          {/* Pro Studio Rack */}
          <ProStudioRack theme={t} isPlaying={isPlaying} showRack={showRack} />
        </div>
      </div>
    </div>
  );
}
