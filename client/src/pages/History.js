import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TrackTile from '../components/TrackTile';
import TrackDetail from '../components/TrackDetail';
import { useTheme } from '../hooks/useTheme';
import { useApi } from '../hooks/useApi';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function History({ onBack, onReconduct, onShare }) {
  const { get, post } = useApi();
  const t = useTheme();
  const [tracks, setTracks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [detailTrack, setDetailTrack] = useState(null);

  useEffect(() => { loadTracks(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTracks = async () => {
    try { const data = await get('/api/history?limit=50'); setTracks(data); } catch (_) { /* load error */ }
  };

  const handleAction = async (trackId, action) => {
    try { await post('/api/history/action', { session_id: 'current', track_id: trackId, action }); loadTracks(); } catch (_) { /* action error */ }
  };

  const handleReconduct = (track) => {
    setDetailTrack(null);
    onReconduct?.(track);
  };

  const filtered = tracks.filter(tr => {
    if (filter === 'loved') return tr.loved;
    if (filter === 'pinned') return tr.pinned;
    return true;
  });

  const chartData = tracks.slice().reverse().map((tr, i) => ({
    index: i, phase: tr.phase, bpm: tr.bpm,
    energy: tr.phase === 1 ? 100 : tr.phase === 2 ? 70 : tr.phase === 3 ? 40 : 20,
  }));

  return (
    <div data-testid="history-page" className="min-h-screen px-6 py-8">
      <div className="texture-grain-subtle fixed inset-0 pointer-events-none z-0" />
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="mb-8">
          <button data-testid="history-back-btn" className="font-data text-[10px] tracking-widest mb-2 block transition-colors hover:opacity-80" style={{ color: t.textMuted }} onClick={onBack}>
            &larr; BACK
          </button>
          <h1 className="font-display text-4xl tracking-tighter" style={{ color: t.text }}>THE VAULT</h1>
          <p className="font-data text-[10px] tracking-widest mt-1" style={{ color: t.textMuted }}>
            {tracks.length} GENERATED TRACKS — TAP ANY TO EXPAND
          </p>
        </div>

        {chartData.length > 1 && (
          <motion.div className="glass-card rounded-xl p-4 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="font-data text-[9px] tracking-widest block mb-3" style={{ color: t.textMuted }}>VIBE EVOLUTION</span>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={chartData}>
                <XAxis dataKey="index" hide />
                <YAxis hide domain={[0, 110]} />
                <Tooltip
                  contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: '10px', color: t.text }}
                  labelFormatter={() => ''}
                  formatter={(value, name) => [value, name === 'bpm' ? 'BPM' : 'ENERGY']}
                />
                <Line type="monotone" dataKey="energy" stroke={t.accent} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="bpm" stroke={t.accent2} strokeWidth={1} dot={false} opacity={0.5} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        <div className="flex gap-2 mb-6">
          {['all', 'loved', 'pinned'].map(f => (
            <button key={f} data-testid={`history-filter-${f}`}
              className="font-data text-[10px] tracking-wider px-4 py-2 rounded-full border transition-all"
              style={{
                borderColor: filter === f ? t.text : t.border,
                color: filter === f ? t.text : t.textMuted,
                background: filter === f ? `${t.text}08` : 'transparent',
              }}
              onClick={() => setFilter(f)}
            >{f.toUpperCase()}</button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((track, i) => (
            <motion.div key={track.track_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => setDetailTrack(track)} style={{ cursor: 'pointer' }}>
              <TrackTile track={track} onAction={handleAction} />
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <span className="font-display text-2xl" style={{ color: t.textMuted }}>The Vault is empty</span>
            <p className="font-editorial text-sm mt-2" style={{ color: t.textMuted }}>
              {filter === 'all' ? 'Conduct your first vibe to start building your collection.' : `No ${filter} tracks yet.`}
            </p>
          </div>
        )}
      </div>

      {/* Track Detail Modal */}
      <AnimatePresence>
        {detailTrack && (
          <TrackDetail
            track={detailTrack}
            onReconduct={handleReconduct}
            onShare={(track) => { setDetailTrack(null); onShare?.(track); }}
            onClose={() => setDetailTrack(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
