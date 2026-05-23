// Complete skin definitions with full token sets
// Each skin defines every color token the UI needs

export const PHASE_COLORS = {
  1: { accent: '#EA00F2', bg: '#0A0A0F', name: 'PEAK-BASS', glow: 'rgba(234,0,242,0.3)' },
  2: { accent: '#00E6F2', bg: '#0A0A0F', name: 'MAIN-FLOOR', glow: 'rgba(0,230,242,0.3)' },
  3: { accent: '#A7C7E7', bg: '#0F0F1A', name: 'SUNRISE', glow: 'rgba(167,199,231,0.3)' },
  4: { accent: '#E9967A', bg: '#1A1610', name: 'ZONED-OUT', glow: 'rgba(233,150,122,0.3)' },
};

export const SKINS = {
  original: {
    name: 'Original Juke',
    bg: '#0A0A0F',
    surface: '#121215',
    surfaceGlass: 'rgba(10,10,15,0.6)',
    accent1: '#EA00F2',
    accent2: '#00E6F2',
    text: '#FFFFFF',
    textSecondary: '#8A8A93',
    textMuted: '#55555C',
    border: '#1E1E24',
    borderHover: 'rgba(0,230,242,0.3)',
    knobTop: '#1a1a24',
    knobBottom: '#0A0A0F',
    knobBorder: '#2a2a35',
    panelBg: '#0A0A0F',
    cardShadow: 'rgba(0,0,0,0.4)',
    shimmerColor: null, // uses phase accent
    vizBg: 'rgba(10,10,15,0.2)',
    scrollTrack: '#0A0A0F',
    scrollThumb: '#1E1E24',
    invertLogo: false,
  },
  obsidian: {
    name: 'Obsidian Matte',
    bg: '#080808',
    surface: '#0E0E0E',
    surfaceGlass: 'rgba(8,8,8,0.7)',
    accent1: '#DC143C',
    accent2: '#FF4060',
    text: '#E8E0D8',
    textSecondary: '#7A7068',
    textMuted: '#4A4440',
    border: '#1A1515',
    borderHover: 'rgba(220,20,60,0.3)',
    knobTop: '#181010',
    knobBottom: '#080808',
    knobBorder: '#2A1515',
    panelBg: '#0A0808',
    cardShadow: 'rgba(0,0,0,0.5)',
    shimmerColor: '#DC143C',
    vizBg: 'rgba(8,8,8,0.25)',
    scrollTrack: '#080808',
    scrollThumb: '#1A1515',
    invertLogo: false,
  },
  paper: {
    name: 'Paper',
    bg: '#F2E6CE',
    surface: '#E8DCC6',
    surfaceGlass: 'rgba(242,230,206,0.7)',
    accent1: '#0A0A0F',
    accent2: '#EA00F2',
    text: '#0A0A0F',
    textSecondary: '#5A5040',
    textMuted: '#8A8070',
    border: '#D4C5A9',
    borderHover: 'rgba(10,10,15,0.2)',
    knobTop: '#D8CDB5',
    knobBottom: '#C4B89E',
    knobBorder: '#BFB49A',
    panelBg: '#EAE0CC',
    cardShadow: 'rgba(100,80,50,0.12)',
    shimmerColor: '#0A0A0F',
    vizBg: 'rgba(200,190,170,0.3)',
    scrollTrack: '#E8DCC6',
    scrollThumb: '#C4B89E',
    invertLogo: true,
  },
  glass: {
    name: 'Glass',
    bg: '#0D0D14',
    surface: '#13131C',
    surfaceGlass: 'rgba(13,13,20,0.4)',
    accent1: '#FFFFFF',
    accent2: '#A7C7E7',
    text: '#FFFFFF',
    textSecondary: '#9090A0',
    textMuted: '#606070',
    border: 'rgba(255,255,255,0.08)',
    borderHover: 'rgba(167,199,231,0.25)',
    knobTop: '#1A1A28',
    knobBottom: '#0D0D14',
    knobBorder: 'rgba(255,255,255,0.1)',
    panelBg: 'rgba(13,13,20,0.5)',
    cardShadow: 'rgba(0,0,0,0.3)',
    shimmerColor: '#A7C7E7',
    vizBg: 'rgba(13,13,20,0.15)',
    scrollTrack: '#0D0D14',
    scrollThumb: 'rgba(255,255,255,0.08)',
    invertLogo: false,
  },
  carbon: {
    name: 'Carbon',
    bg: '#0A0A0A',
    surface: '#0F120F',
    surfaceGlass: 'rgba(10,15,10,0.7)',
    accent1: '#00FF41',
    accent2: '#00CC33',
    text: '#00FF41',
    textSecondary: '#00AA30',
    textMuted: '#006620',
    border: '#1A2A1A',
    borderHover: 'rgba(0,255,65,0.25)',
    knobTop: '#101A10',
    knobBottom: '#0A0A0A',
    knobBorder: '#1A2A1A',
    panelBg: '#0A0E0A',
    cardShadow: 'rgba(0,20,0,0.4)',
    shimmerColor: '#00FF41',
    vizBg: 'rgba(0,10,0,0.25)',
    scrollTrack: '#0A0A0A',
    scrollThumb: '#1A2A1A',
    invertLogo: false,
  },
};

export const VIBE_TAGS = [
  '#Warehouse', '#RainyAfternoon', '#SunrisePatio', '#LofiStudy',
  '#BassWeight', '#DarkRoom', '#AfterHours', '#SoundSystem',
  '#PirateRadio', '#FabricLondon', '#Berghain', '#UKGarage',
];

// Merge skin + phase into a unified theme for components
export function getTheme(skinKey, phaseCode) {
  const skin = SKINS[skinKey] || SKINS.original;
  const phase = PHASE_COLORS[phaseCode] || PHASE_COLORS[1];

  // For skins with their own strong identity, override the phase accent
  const useSkinAccent = skinKey === 'obsidian' || skinKey === 'carbon' || skinKey === 'paper';
  const accent = useSkinAccent ? skin.accent1 : phase.accent;
  const accent2 = useSkinAccent ? skin.accent2 : (skinKey === 'glass' ? skin.accent2 : phase.accent);
  const glow = useSkinAccent
    ? `${skin.accent1}4D`
    : phase.glow;

  // For Paper skin, override background regardless of phase
  const bg = skinKey === 'paper' ? skin.bg : (skinKey === 'original' ? phase.bg : skin.bg);

  return {
    ...skin,
    accent,
    accent2,
    glow,
    bg,
    phaseName: phase.name,
    phaseCode,
    skinKey,
  };
}
