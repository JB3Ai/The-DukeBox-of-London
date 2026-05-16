// --- STATE MANAGEMENT ARCHITECTURE ---
let selectedPhaseCode = 1;
let selectedGenreCode = null;
let selectedAtmosphere = 'dark';
let selectedVocalStyle = 'off';
let currentBpm = 136;
let waveAnimationFrame = null;
let meshTime = 0;

// Phase Parameters Master Configuration (Design Spec Reference)
const phaseMap = {
  1: { name: 'PEAK-BASS', key: 'peak-bass', minBpm: 140, maxBpm: 180, defaultBpm: 150 },
  2: { name: 'MAIN-FLOOR', key: 'main-floor', minBpm: 120, maxBpm: 140, defaultBpm: 128 },
  3: { name: 'SUNRISE', key: 'sunrise', minBpm: 100, maxBpm: 128, defaultBpm: 118 },
  4: { name: 'ZONED-OUT', key: 'zoned-out', minBpm: 60, maxBpm: 100, defaultBpm: 80 },
};

// Hardcoded Local Mirror of the 51-Genre Data Model for instantaneous UI layout
const genreMatrix = [
  { code: 'B-01', name: 'Peak Hour Techno', phase: 1, bpm: [145, 160] },
  { code: 'B-02', name: 'Neurofunk', phase: 1, bpm: [170, 180] },
  { code: 'B-03', name: 'Hard Techno', phase: 1, bpm: [150, 165] },
  { code: 'B-04', name: 'Bass House', phase: 1, bpm: [125, 135] },
  { code: 'B-05', name: 'Dubstep (Riddim)', phase: 1, bpm: [140, 150] },
  { code: 'B-06', name: 'Dubstep (OG)', phase: 1, bpm: [138, 142] },
  { code: 'B-07', name: 'Brostep', phase: 1, bpm: [140, 150] },
  { code: 'B-08', name: 'Jungle', phase: 1, bpm: [160, 180] },
  { code: 'B-09', name: 'Drumstep', phase: 1, bpm: [165, 175] },
  { code: 'B-10', name: 'Acid Techno', phase: 1, bpm: [140, 155] },
  { code: 'B-11', name: 'Psytrance', phase: 1, bpm: [138, 150] },
  { code: 'B-12', name: 'Ghetto House / Juke', phase: 1, bpm: [155, 165] },
  { code: 'B-13', name: 'Hardstyle', phase: 1, bpm: [150, 160] },
  { code: 'H-13', name: 'Deep House', phase: 2, bpm: [120, 125] },
  { code: 'H-14', name: 'Tech House', phase: 2, bpm: [124, 130] },
  { code: 'M-15', name: 'Minimal Techno', phase: 2, bpm: [128, 135] },
  { code: 'M-16', name: 'Melodic Techno', phase: 2, bpm: [122, 132] },
  { code: 'G-17', name: 'UK Garage (2-Step)', phase: 2, bpm: [130, 140] },
  { code: 'G-18', name: 'Bassline', phase: 2, bpm: [130, 140] },
  { code: 'H-19', name: 'Progressive House', phase: 2, bpm: [126, 132] },
  { code: 'H-20', name: 'Afro House', phase: 2, bpm: [120, 128] },
  { code: 'H-21', name: 'Amapiano', phase: 2, bpm: [110, 120] },
  { code: 'H-22', name: "Jackin' House", phase: 2, bpm: [124, 130] },
  { code: 'D-23', name: 'Nu-Disco', phase: 2, bpm: [118, 126] },
  { code: 'D-24', name: 'Italo Disco', phase: 2, bpm: [118, 125] },
  { code: 'D-25', name: 'Liquid D&B', phase: 2, bpm: [170, 178] },
  { code: 'O-26', name: 'Organic House', phase: 3, bpm: [118, 124] },
  { code: 'O-27', name: 'Microhouse', phase: 3, bpm: [120, 130] },
  { code: 'O-28', name: 'Balearic Beat', phase: 3, bpm: [100, 118] },
  { code: 'O-29', name: 'Breakbeat', phase: 3, bpm: [120, 140] },
  { code: 'O-30', name: 'French House', phase: 3, bpm: [120, 128] },
  { code: 'O-31', name: 'Electro (Detroit)', phase: 3, bpm: [125, 135] },
  { code: 'O-32', name: 'Future Garage', phase: 3, bpm: [130, 140] },
  { code: 'O-33', name: 'Leftfield House', phase: 3, bpm: [118, 128] },
  { code: 'O-34', name: 'Dub Techno', phase: 3, bpm: [120, 130] },
  { code: 'L-35', name: 'Lo-Fi House', phase: 3, bpm: [115, 125] },
  { code: 'A-36', name: 'Trip-Hop', phase: 4, bpm: [70, 100] },
  { code: 'A-37', name: 'Downtempo', phase: 4, bpm: [80, 110] },
  { code: 'A-38', name: 'Lo-Fi Hip Hop', phase: 4, bpm: [70, 90] },
  { code: 'A-39', name: 'Ambient Dub', phase: 4, bpm: [60, 90] },
  { code: 'A-40', name: 'Chillwave', phase: 4, bpm: [80, 110] },
  { code: 'A-41', name: 'Vaporwave', phase: 4, bpm: [60, 100] },
  { code: 'A-42', name: 'Psybient', phase: 4, bpm: [80, 120] },
  { code: 'A-43', name: 'IDM', phase: 4, bpm: [100, 140] },
  { code: 'A-44', name: 'Folktronica', phase: 4, bpm: [80, 120] },
  { code: 'A-45', name: 'Glitch-Hop', phase: 4, bpm: [90, 110] },
  { code: 'A-46', name: 'Ethereal Wave', phase: 4, bpm: [80, 120] },
  { code: 'A-47', name: 'Dark Ambient', phase: 4, bpm: [60, 80] },
  { code: 'A-48', name: 'Illbient', phase: 4, bpm: [60, 90] },
  { code: 'A-49', name: 'Space Music', phase: 4, bpm: [60, 80] },
  { code: 'A-50', name: 'Post-Classical', phase: 4, bpm: [60, 90] },
];

const safeVibrate = (pattern) => {
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern);
  }
};

function showScreen(screenId) {
  document.querySelectorAll('.app-screen').forEach((screen) => {
    screen.classList.remove('active');
    screen.classList.add('hidden');
  });

  const target = document.getElementById(screenId);
  if (!target) return;
  target.classList.remove('hidden');
  target.classList.add('active');
}

function syncPhaseTheme(cfg) {
  document.body.dataset.phase = cfg.key;

  const phaseChip = document.getElementById('phase-chip');
  if (phaseChip) {
    phaseChip.innerText = `${cfg.name} · ${cfg.defaultBpm} BPM`;
  }

  document.querySelectorAll('.phase-card').forEach((card) => {
    card.classList.toggle('is-current', card.dataset.phase === cfg.name);
  });
}

// Action: User maps quadrant based on code integers
function selectPhase(phaseCode) {
  selectedPhaseCode = parseInt(phaseCode, 10) || 1;
  if (phaseCode === 'PEAK-BASS') selectedPhaseCode = 1;
  if (phaseCode === 'MAIN-FLOOR') selectedPhaseCode = 2;
  if (phaseCode === 'SUNRISE') selectedPhaseCode = 3;
  if (phaseCode === 'ZONED-OUT') selectedPhaseCode = 4;

  const cfg = phaseMap[selectedPhaseCode];
  syncPhaseTheme(cfg);

  document.getElementById('selected-phase-title').innerText = `PHASE ${selectedPhaseCode}: ${cfg.name}`;
  document.getElementById('phase-meta-readout').innerText = `${cfg.defaultBpm} BPM STANDARD`;

  const slider = document.getElementById('bpm-slider');
  slider.min = cfg.minBpm;
  slider.max = cfg.maxBpm;
  slider.value = cfg.defaultBpm;
  updateBpmReadout(cfg.defaultBpm);

  document.getElementById('slider-min-label').innerText = `${cfg.minBpm} BPM`;
  document.getElementById('slider-max-label').innerText = `${cfg.maxBpm} BPM`;

  populateGenres(selectedPhaseCode);
  safeVibrate(15);
  showScreen('screen-refine');
}

function populateGenres(phaseCode) {
  const container = document.getElementById('genre-bento-grid');
  container.innerHTML = '';
  selectedGenreCode = null;

  const targeted = genreMatrix.filter((genre) => genre.phase === phaseCode);
  targeted.forEach((genre) => {
    const el = document.createElement('div');
    el.className = 'genre-card';
    el.id = `genre-card-${genre.code}`;
    el.innerHTML = `
      <h4>${genre.name}</h4>
      <span>CODE: ${genre.code} [${genre.bpm[0]}-${genre.bpm[1]} BPM]</span>
    `;
    el.onclick = () => setGenreSelection(genre.code, genre.bpm[0]);
    container.appendChild(el);
  });
}

function setGenreSelection(code, minBpm) {
  document.querySelectorAll('.genre-card').forEach((card) => card.classList.remove('selected'));
  const card = document.getElementById(`genre-card-${code}`);
  if (card) card.classList.add('selected');
  selectedGenreCode = code;

  const slider = document.getElementById('bpm-slider');
  slider.value = minBpm;
  updateBpmReadout(minBpm);
  safeVibrate(10);
}

function setAtmosphere(value) {
  setActiveSegment('atmosphere-control', value);
  selectedAtmosphere = value;
}

function setVocal(value) {
  setActiveSegment('vocal-control', value);
  selectedVocalStyle = value === 'off' ? null : value;
}

function setActiveSegment(containerId, valueText) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll('.seg-btn').forEach((button) => {
    button.classList.remove('active');
    if (button.innerText.toLowerCase().includes(valueText.toLowerCase())) {
      button.classList.add('active');
    }
  });
}

function updateBpmReadout(value) {
  currentBpm = parseInt(value, 10);
  document.getElementById('bpm-readout').innerText = `${value} BPM`;
}

// Upgraded API Request Engine passing perfect architectural payload maps
async function startConducting() {
  const btn = document.querySelector('.master-btn');
  const lyricsStream = document.getElementById('lyrics-stream');
  const cfg = phaseMap[selectedPhaseCode];

  btn.innerText = 'SYNCING NEURAL BUFFER...';
  btn.style.opacity = '0.5';

  showScreen('screen-cockpit');
  lyricsStream.innerText = `Assembling Latent Seed Generator... [Phase: ${selectedPhaseCode}]`;

  try {
    const response = await fetch('/api/conduct', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phase: cfg.name,
        phase_code: selectedPhaseCode,
        atmosphere: selectedAtmosphere,
        bpm: currentBpm,
        vocal_style: selectedVocalStyle,
        genre_code: selectedGenreCode,
        artistSeed: 'London Legacy Workspace Engine',
        artist_seed: 'London Legacy Workspace Engine',
      }),
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error || 'Generation failed');

    const inlineData = payload?.audioData;
    const data = inlineData?.data || '';
    const mimeType = inlineData?.mimeType || 'audio/wav';

    if (data) {
      const audioEl = document.getElementById('generated-audio');
      audioEl.src = `data:${mimeType};base64,${data}`;
      await audioEl.play().catch(() => console.log('Autoplay deferred'));
    }

    if (payload?.name) document.getElementById('active-track').innerText = payload.name;
    lyricsStream.innerText = payload.lyrics || 'Neural Sync Complete. Playback Active.';
    safeVibrate([18, 32, 18]);
  } catch (error) {
    lyricsStream.innerText = `TRANSMISSION ERROR: ${error.message}`;
  } finally {
    btn.innerText = 'CONDUCTING VIBE...';
    btn.style.opacity = '1';
  }
}

// Placeholder Visualizer Thread mapping Canvas loop
const canvas = document.getElementById('neural-mesh');
const ctx = canvas?.getContext('2d');

function drawMesh() {
  if (!canvas || !ctx) return;

  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(0, 230, 242, 0.3)';
  ctx.beginPath();
  for (let i = 0; i < width; i += 15) {
    ctx.moveTo(i, height / 2 + Math.sin(meshTime + i * 0.05) * 15);
    ctx.lineTo(i + 15, height / 2 + Math.sin(meshTime + (i + 15) * 0.05) * 15);
  }
  ctx.stroke();
  meshTime += 0.04;
  waveAnimationFrame = requestAnimationFrame(drawMesh);
}

document.querySelectorAll('.phase-card').forEach((card) => {
  card.addEventListener('click', () => selectPhase(card.dataset.phase));
});

window.showScreen = showScreen;
window.selectPhase = selectPhase;
window.setAtmosphere = setAtmosphere;
window.setVocal = setVocal;
window.updateBpmReadout = updateBpmReadout;
window.startConducting = startConducting;

syncPhaseTheme(phaseMap[selectedPhaseCode]);
drawMesh();

window.addEventListener('beforeunload', () => {
  if (waveAnimationFrame) cancelAnimationFrame(waveAnimationFrame);
});
