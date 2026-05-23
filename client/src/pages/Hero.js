import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HERO_IMAGES = [
  'https://customer-assets.emergentagent.com/job_phase-roadmap-1/artifacts/1p50s7xb_ChatGPT%20Image%20May%2011%2C%202026%2C%2012_52_14%20AM.png',
  'https://customer-assets.emergentagent.com/job_phase-roadmap-1/artifacts/p12lyamf_ChatGPT%20Image%20May%2011%2C%202026%2C%2012_54_07%20AM.png',
  'https://customer-assets.emergentagent.com/job_phase-roadmap-1/artifacts/b7k3q0c5_ChatGPT%20Image%20May%2011%2C%202026%2C%2012_54_20%20AM.png',
  'https://customer-assets.emergentagent.com/job_phase-roadmap-1/artifacts/b4s7dncz_ChatGPT%20Image%20May%2011%2C%202026%2C%2012_55_36%20AM.png',
];

export default function Hero({ onEnter }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // Cycle hero images every 6 seconds
  useEffect(() => {
    const iv = setInterval(() => setImgIdx(i => (i + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(iv);
  }, []);

  // Preload images
  useEffect(() => {
    let count = 0;
    HERO_IMAGES.forEach(src => {
      const img = new Image();
      img.onload = () => { count++; if (count >= 1) setLoaded(true); };
      img.src = src;
    });
  }, []);

  return (
    <div data-testid="hero-page" className="fixed inset-0 z-[200] overflow-hidden" style={{ background: '#000' }}>
      {/* Cycling background images with crossfade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={imgIdx}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.55, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          style={{
            backgroundImage: `url(${HERO_IMAGES[imgIdx]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </AnimatePresence>

      {/* Grain texture overlay */}
      <div className="texture-grain absolute inset-0 pointer-events-none z-10" />

      {/* Dark vignette */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.7) 100%)',
      }} />

      {/* Scanline overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)',
        backgroundSize: '100% 4px',
      }} />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Logo reveal */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={loaded ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Tagline above */}
          <motion.p
            className="font-data text-[10px] tracking-[0.5em] mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={loaded ? { opacity: 0.6, y: 0 } : {}}
            transition={{ duration: 1, delay: 0.8 }}
            style={{ color: '#fff' }}
          >
            AI-POWERED ELECTRONIC MUSIC
          </motion.p>

          {/* Main title */}
          <motion.h1
            className="font-display leading-none"
            style={{ fontSize: 'clamp(4rem, 12vw, 10rem)', color: '#fff', textShadow: '0 0 60px rgba(234,0,242,0.4), 0 0 120px rgba(0,230,242,0.2)' }}
            initial={{ opacity: 0, y: 40, letterSpacing: '0.3em' }}
            animate={loaded ? { opacity: 1, y: 0, letterSpacing: '-0.02em' } : {}}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            JUKEBOX
          </motion.h1>

          {/* Subtitle */}
          <motion.div
            className="flex items-center justify-center gap-3 mt-4"
            initial={{ opacity: 0 }}
            animate={loaded ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, rgba(234,0,242,0.6))' }} />
            <span className="font-data text-[9px] tracking-[0.4em]" style={{ color: 'rgba(255,255,255,0.5)' }}>
              LONDON LEGEND EDITION
            </span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, rgba(0,230,242,0.6), transparent)' }} />
          </motion.div>

          {/* Feature badges */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            {['4 ENERGY PHASES', '51 SUB-GENRES', 'REAL-TIME SYNTH', '5 VISUAL SKINS'].map(tag => (
              <span key={tag} className="font-data text-[8px] tracking-wider px-3 py-1.5 rounded-full" style={{
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.45)',
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(8px)',
              }}>
                {tag}
              </span>
            ))}
          </motion.div>

          {/* Enter button */}
          <motion.button
            data-testid="hero-enter-btn"
            className="mt-16 relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onEnter}
          >
            <div className="px-16 py-5 rounded-full font-ui font-bold text-sm tracking-[0.3em] relative z-10"
              style={{
                color: '#fff',
                border: '1px solid rgba(234,0,242,0.4)',
                background: 'rgba(234,0,242,0.08)',
                backdropFilter: 'blur(12px)',
              }}>
              ENTER
            </div>
            {/* Glow pulse behind button */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  '0 0 30px rgba(234,0,242,0.15), 0 0 60px rgba(0,230,242,0.08)',
                  '0 0 50px rgba(234,0,242,0.3), 0 0 100px rgba(0,230,242,0.15)',
                  '0 0 30px rgba(234,0,242,0.15), 0 0 60px rgba(0,230,242,0.08)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.button>

          {/* Scroll indicator */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0 }}
            animate={loaded ? { opacity: 0.3, y: [0, 6, 0] } : {}}
            transition={{ duration: 2, repeat: Infinity, delay: 2.5 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom edge gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none" style={{
        background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.8))',
      }} />
    </div>
  );
}
