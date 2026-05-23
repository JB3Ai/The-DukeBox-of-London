import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { getTheme } from '../data/constants';

const ThemeContext = createContext(null);

export function ThemeProvider({ skinKey, phaseCode, children }) {
  const theme = useMemo(() => getTheme(skinKey, phaseCode), [skinKey, phaseCode]);

  // Push all tokens to CSS custom properties on :root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--skin-bg', theme.bg);
    root.style.setProperty('--skin-surface', theme.surface);
    root.style.setProperty('--skin-surface-glass', theme.surfaceGlass);
    root.style.setProperty('--skin-accent', theme.accent);
    root.style.setProperty('--skin-accent2', theme.accent2);
    root.style.setProperty('--skin-text', theme.text);
    root.style.setProperty('--skin-text-secondary', theme.textSecondary);
    root.style.setProperty('--skin-text-muted', theme.textMuted);
    root.style.setProperty('--skin-border', theme.border);
    root.style.setProperty('--skin-border-hover', theme.borderHover);
    root.style.setProperty('--skin-knob-top', theme.knobTop);
    root.style.setProperty('--skin-knob-bottom', theme.knobBottom);
    root.style.setProperty('--skin-knob-border', theme.knobBorder);
    root.style.setProperty('--skin-panel-bg', theme.panelBg);
    root.style.setProperty('--skin-card-shadow', theme.cardShadow);
    root.style.setProperty('--skin-glow', theme.glow);
    root.style.setProperty('--skin-viz-bg', theme.vizBg);
    root.style.setProperty('--skin-scroll-track', theme.scrollTrack);
    root.style.setProperty('--skin-scroll-thumb', theme.scrollThumb);
    // For the shimmer edge
    root.style.setProperty('--phase-color', theme.shimmerColor || theme.accent);

    // Body-level colors
    document.body.style.background = theme.bg;
    document.body.style.color = theme.text;
  }, [theme]);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme must be used within ThemeProvider');
  return t;
}
