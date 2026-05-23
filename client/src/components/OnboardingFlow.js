import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';

const STEPS = [
  {
    id: 'atmosphere',
    label: 'ATMOSPHERE',
    question: 'What mood are you feeling?',
    options: [
      { value: 'dark', label: 'DARK & MOODY', desc: 'Low-pass, minor keys, deep shadows' },
      { value: 'balanced', label: 'BALANCED', desc: 'Neutral energy, steady groove' },
      { value: 'uplifting', label: 'UPLIFTING', desc: 'Major keys, bright air, euphoria' },
    ],
  },
  {
    id: 'vocal',
    label: 'VOCALS',
    question: 'Vocal presence?',
    options: [
      { value: null, label: 'NO VOCALS', desc: 'Pure instrumental — ambient default' },
      { value: 'male', label: 'MALE', desc: 'Deep, resonant vocal texture' },
      { value: 'female', label: 'FEMALE', desc: 'Ethereal, soaring vocal lines' },
      { value: 'ethereal', label: 'ETHEREAL', desc: 'Processed, otherworldly fragments' },
    ],
  },
  {
    id: 'bpm',
    label: 'VELOCITY',
    question: 'Set your speed',
    type: 'slider',
  },
  {
    id: 'seeds',
    label: 'STYLE SEEDS',
    question: 'Choose your starting point',
    options: [
      { value: 'preset-a', label: 'WAREHOUSE RAW', desc: 'Stripped-back, 4AM energy' },
      { value: 'preset-b', label: 'MELODIC JOURNEY', desc: 'Progressive build, emotional arcs' },
      { value: 'preset-c', label: 'BASS CULTURE', desc: 'Sub-heavy, UK sound system roots' },
    ],
  },
];

export default function OnboardingFlow({ phase, onComplete, onClose }) {
  const t = useTheme();
  const [step, setStep] = useState(0);
  const [atmosphere, setAtmosphere] = useState('balanced');
  const [vocal, setVocal] = useState(null);
  const [bpm, setBpm] = useState(128);
  const [seed, setSeed] = useState(null);

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      onComplete({ atmosphere, vocal_style: vocal, bpm, seed });
    }
  }, [step, atmosphere, vocal, bpm, seed, onComplete]);

  const handleSurprise = useCallback(() => {
    onComplete({ atmosphere: 'balanced', bpm: 128, surprise_me: true });
  }, [onComplete]);

  const getValue = () => {
    if (current.id === 'atmosphere') return atmosphere;
    if (current.id === 'vocal') return vocal;
    if (current.id === 'seeds') return seed;
    return null;
  };

  const setValue = (v) => {
    if (current.id === 'atmosphere') setAtmosphere(v);
    if (current.id === 'vocal') setVocal(v);
    if (current.id === 'seeds') setSeed(v);
  };

  return (
    <motion.div
      data-testid="onboarding-flow"
      className="fixed inset-0 z-[150] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: `${t.bg}E8`, backdropFilter: 'blur(20px)' }} onClick={onClose} />
      <div className="texture-grain absolute inset-0 pointer-events-none opacity-30" />

      <motion.div
        className="relative z-10 w-full max-w-lg"
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Progress bar */}
        <div className="h-0.5 rounded-full mb-6 overflow-hidden" style={{ background: t.border }}>
          <motion.div className="h-full rounded-full" animate={{ width: `${progress}%` }} style={{ background: t.accent }} transition={{ duration: 0.4 }} />
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-6">
          <span className="font-data text-[9px] tracking-widest" style={{ color: t.textMuted }}>
            STEP {step + 1} OF {STEPS.length}
          </span>
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <div key={s.id} className="w-2 h-2 rounded-full transition-colors" style={{ background: i <= step ? t.accent : t.border }} />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8" style={{ border: `1px solid ${t.border}` }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Step label */}
              <span className="font-data text-[10px] tracking-[0.3em] block mb-2" style={{ color: t.accent }}>
                {current.label}
              </span>
              <h2 className="font-display text-2xl tracking-tight mb-6" style={{ color: t.text }}>
                {current.question}
              </h2>

              {/* Options or Slider */}
              {current.type === 'slider' ? (
                <div className="mb-8">
                  <div className="flex justify-between mb-2">
                    <span className="font-data text-[9px]" style={{ color: t.textMuted }}>SLOW</span>
                    <span className="font-display text-xl" style={{ color: t.accent }}>{bpm}</span>
                    <span className="font-data text-[9px]" style={{ color: t.textMuted }}>FAST</span>
                  </div>
                  <input
                    data-testid="onboarding-bpm-slider"
                    type="range" min="60" max="180" value={bpm}
                    onChange={e => setBpm(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(90deg, ${t.accent} ${((bpm - 60) / 120) * 100}%, ${t.border} ${((bpm - 60) / 120) * 100}%)` }}
                  />
                  <span className="font-data text-[9px] block text-center mt-3" style={{ color: t.textMuted }}>BPM</span>
                </div>
              ) : (
                <div className="space-y-3 mb-8">
                  {current.options.map(opt => {
                    const isSelected = getValue() === opt.value;
                    return (
                      <motion.button
                        key={opt.value || 'none'}
                        data-testid={`onboarding-opt-${opt.value || 'none'}`}
                        className="w-full rounded-xl p-4 text-left transition-all"
                        style={{
                          background: isSelected ? `${t.accent}12` : 'transparent',
                          border: `1px solid ${isSelected ? t.accent : t.border}`,
                          boxShadow: isSelected ? `0 0 20px ${t.glow}` : 'none',
                        }}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setValue(opt.value)}
                      >
                        <span className="font-ui text-sm font-bold block" style={{ color: isSelected ? t.accent : t.text }}>{opt.label}</span>
                        <span className="font-data text-[9px] block mt-1" style={{ color: t.textMuted }}>{opt.desc}</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3">
            {step > 0 && (
              <button
                data-testid="onboarding-back"
                className="px-6 py-3 rounded-xl font-data text-[10px] tracking-wider border transition-all"
                style={{ borderColor: t.border, color: t.textMuted }}
                onClick={() => setStep(s => s - 1)}
              >
                BACK
              </button>
            )}
            <motion.button
              data-testid="onboarding-next"
              className="flex-1 py-3 rounded-xl font-ui font-bold text-sm tracking-wider"
              style={{ background: `${t.accent}15`, border: `1px solid ${t.accent}40`, color: t.accent }}
              whileHover={{ boxShadow: `0 0 20px ${t.glow}` }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
            >
              {step === STEPS.length - 1 ? 'CONDUCT' : 'NEXT'}
            </motion.button>
          </div>

          {/* Surprise Me */}
          <button
            data-testid="onboarding-surprise"
            className="w-full mt-3 py-2 font-data text-[9px] tracking-wider transition-colors"
            style={{ color: t.textMuted }}
            onClick={handleSurprise}
          >
            SURPRISE ME — RANDOMISE ALL
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
