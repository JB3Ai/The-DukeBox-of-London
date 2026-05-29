import React, { useRef, useEffect, useCallback } from 'react';
import { getEngine } from '../audio/engine';
import { SKINS } from '../data/constants';

// Accept skinKey to determine visualizer colors
export default function Visualizer({ phase, isPlaying, bpm = 128, skinKey = 'original' }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  // Determine visualizer colors based on skin
  const getColors = useCallback(() => {
    if (skinKey === 'obsidian') return { primary: '#DC143C', secondary: '#FF4060' };
    if (skinKey === 'paper') return { primary: '#0A0A0F', secondary: '#EA00F2' };
    if (skinKey === 'glass') return { primary: '#A7C7E7', secondary: '#FFFFFF' };
    if (skinKey === 'carbon') return { primary: '#00FF41', secondary: '#00CC33' };
    // Original: use phase colors
    const phaseColors = {
      1: { primary: '#EA00F2', secondary: '#00E6F2' },
      2: { primary: '#00E6F2', secondary: '#EA00F2' },
      3: { primary: '#A7C7E7', secondary: '#E9967A' },
      4: { primary: '#E9967A', secondary: '#A7C7E7' },
    };
    return phaseColors[phase] || phaseColors[1];
  }, [phase, skinKey]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const colors = getColors();
    const skin = SKINS[skinKey];

    // Clear with skin-aware background
    ctx.fillStyle = skin?.vizBg || 'rgba(10,10,15,0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const engine = getEngine();
    const analyserData = engine.getAnalyserData();
    const numBars = Math.min(64, analyserData.length);
    const barW = w / numBars;
    const hasAudio = isPlaying && analyserData.some(v => v > 5);

    for (let i = 0; i < numBars; i++) {
      let barH;
      if (hasAudio) {
        barH = (analyserData[i] / 255) * h * 0.9;
      } else if (isPlaying) {
        barH = (Math.random() * 0.3 + 0.1) * h;
      } else {
        barH = 2;
      }

      const x = i * barW;
      const y = h - barH;

      const grad = ctx.createLinearGradient(x, h, x, y);
      grad.addColorStop(0, colors.primary + '15');
      grad.addColorStop(0.4, colors.primary + '90');
      grad.addColorStop(1, colors.secondary + 'DD');

      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y, barW - 2, barH);

      if (barH > h * 0.6) {
        ctx.fillStyle = colors.primary;
        ctx.fillRect(x + 1, y, barW - 2, 2);
      }
    }

    // CRT scanline
    const time = Date.now() * 0.001;
    const scanY = ((time * 50) % h);
    const scanAlpha = skinKey === 'paper' ? 0.03 : 0.015;
    ctx.fillStyle = `rgba(${skinKey === 'paper' ? '0,0,0' : '255,255,255'},${scanAlpha})`;
    ctx.fillRect(0, scanY, w, 2);

    // Grid lines
    ctx.strokeStyle = `rgba(${skinKey === 'paper' ? '0,0,0' : '255,255,255'},0.015)`;
    ctx.lineWidth = 0.5;
    for (let y = 0; y < h; y += h / 8) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    animRef.current = requestAnimationFrame(draw);
  }, [isPlaying, getColors, skinKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas ref={canvasRef} data-testid="audio-visualizer" className="w-full h-full rounded-lg" style={{ imageRendering: 'auto' }} />
  );
}
