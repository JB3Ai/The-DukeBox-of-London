// --- THE DUKEBOX BILINGUAL MATRIX ENGINE ---
let selectedPhaseNum = 1;
let selectedGenreCode = 'B-01';
let selectedAtmosphere = 'dark';
let selectedVocalStyle = null;
let currentVelocityBpm = 150;

let meshPulseState = 0;
let isGeneratingActive = false;
let eggClickCounter = 0;

const phaseMetaSystem = {
  1: { key: 'peak-bass', label: 'Peak-Bass', apiLabel: 'PEAK-BASS', baseBpm: 150, minBpm: 140, maxBpm: 180, angle: -135 },
  2: { key: 'main-floor', label: 'Main-Floor', apiLabel: 'MAIN-FLOOR', baseBpm: 128, minBpm: 120, maxBpm: 140, angle: -45 },
  3: { key: 'sunrise', label: 'Sunrise', apiLabel: 'SUNRISE', baseBpm: 118, minBpm: 100, maxBpm: 128, angle: 45 },
  4: { key: 'zoned-out', label: 'Zoned-Out', apiLabel: 'ZONED-OUT', baseBpm: 92, minBpm: 60, maxBpm: 100, angle: 135 },
};

// Full 51-Genre Architecture Matrix Mapping
const absoluteGenreMatrix = [
  { code: 'B-01', name: 'Peak Hour Techno', phase: 1 },
  { code: 'B-02', name: 'Neurofunk', phase: 1 },
  { code: 'B-03', name: 'Hard Techno', phase: 1 },
  { code: 'B-04', name: 'Bass House', phase: 1 },
  { code: 'B-05', name: 'Dubstep (Riddim)', phase: 1 },
  { code: 'B-06', name: 'Dubstep (OG)', phase: 1 },
  { code: 'B-07', name: 'Brostep', phase: 1 },
  { code: 'B-08', name: 'Jungle', phase: 1 },
  { code: 'B-09', name: 'Drumstep', phase: 1 },
  { code: 'B-10', name: 'Acid Techno', phase: 1 },
  { code: 'B-11', name: 'Psytrance', phase: 1 },
  { code: 'B-12', name: 'Ghetto House / Juke', phase: 1 },
  { code: 'B-13', name: 'Hardstyle', phase: 1 },
  { code: 'H-13', name: 'Deep House', phase: 2 },
  { code: 'H-14', name: 'Tech House', phase: 2 },
  { code: 'M-15', name: 'Minimal Techno', phase: 2 },
  { code: 'M-16', name: 'Melodic Techno', phase: 2 },
  { code: 'G-17', name: 'UK Garage (2-Step)', phase: 2 },
  { code: 'G-18', name: 'Bassline', phase: 2 },
  { code: 'H-19', name: 'Progressive House', phase: 2 },
  { code: 'H-20', name: 'Afro House', phase: 2 },
  { code: 'H-21', name: 'Amapiano', phase: 2 },
  { code: 'H-22', name: "Jackin' House", phase: 2 },
  { code: 'D-23', name: 'Nu-Disco', phase: 2 },
  { code: 'D-24', name: 'Italo Disco', phase: 2 },
  { code: 'D-25', name: 'Liquid D&B', phase: 2 },
  { code: 'O-26', name: 'Organic House', phase: 3 },
  { code: 'O-27', name: 'Microhouse', phase: 3 },
  { code: 'O-28', name: 'Balearic Beat', phase: 3 },
  { code: 'O-29', name: 'Breakbeat', phase: 3 },
  { code: 'O-30', name: 'French House', phase: 3 },
  { code: 'O-31', name: 'Electro (Detroit)', phase: 3 },
  { code: 'O-32', name: 'Future Garage', phase: 3 },
  { code: 'O-33', name: 'Leftfield House', phase: 3 },
  { code: 'O-34', name: 'Dub Techno', phase: 3 },
  { code: 'L-35', name: 'Lo-Fi House', phase: 3 },
  { code: 'A-36', name: 'Trip-Hop', phase: 4 },
  { code: 'A-37', name: 'Downtempo', phase: 4 },
  { code: 'A-38', name: 'Lo-Fi Hip Hop', phase: 4 },
  { code: 'A-39', name: 'Ambient Dub', phase: 4 },
  { code: 'A-40', name: 'Chillwave', phase: 4 },
  { code: 'A-41', name: 'Vaporwave', phase: 4 },
  { code: 'A-42', name: 'Psybient', phase: 4 },
  { code: 'A-43', name: 'IDM', phase: 4 },
  { code: 'A-44', name: 'Folktronica', phase: 4 },
  { code: 'A-45', name: 'Glitch-Hop', phase: 4 },
  { code: 'A-46', name: 'Ethereal Wave', phase: 4 },
  { code: 'A-47', name: 'Dark Ambient', phase: 4 },
  { code: 'A-48', name: 'Illbient', phase: 4 },
  { code: 'A-49', name: 'Space Music', phase: 4 },
  { code: 'A-50', name: 'Post-Classical', phase: 4 },
];

function safeVibrate(pattern) {
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern);
  }
}

function showScreen(screenId) {
  document.querySelectorAll('.app-screen').forEach((screen) => {
    screen.classList.remove('active');
    screen.classList.add('hidden');
  });

  const activeTarget = document.getElementById(screenId);
  if (activeTarget) {
    activeTarget.classList.remove('hidden');
    activeTarget.classList.add('active');
  }
}

function syncPhaseView(phaseNum) {
  const meta = phaseMetaSystem[phaseNum];
  const refineTitle = document.getElementById('refine-screen-title');
  const phaseReadout = document.getElementById('phase-readout');
  const phaseWheel = document.getElementById('phase-wheel');
  const phaseChip = document.getElementById('phase-chip');
  const minLabel = document.getElementById('lbl-min-bpm');
  const maxLabel = document.getElementById('lbl-max-bpm');

  document.body.dataset.phase = meta.key;
  if (refineTitle) refineTitle.innerText = `CONDUCT PHASE: ${meta.label}`;
  if (phaseReadout) phaseReadout.innerText = meta.label;
  if (phaseWheel) {
    phaseWheel.style.setProperty('--wheel-angle', `${meta.angle}deg`);
    phaseWheel.setAttribute('aria-valuenow', String(phaseNum));
    phaseWheel.setAttribute('aria-valuetext', meta.label);
  }
  if (phaseChip) phaseChip.innerText = `${meta.apiLabel} · ${meta.baseBpm} BPM`;
  if (minLabel) minLabel.innerText = `${meta.minBpm} BPM`;
  if (maxLabel) maxLabel.innerText = `${meta.maxBpm} BPM`;
}

function selectPhase(phaseLabel) {
  let targetCode = 1;
  if (phaseLabel === 'MAIN-FLOOR') targetCode = 2;
  if (phaseLabel === 'SUNRISE') targetCode = 3;
  if (phaseLabel === 'ZONED-OUT') targetCode = 4;

  selectedPhaseNum = targetCode;
  const meta = phaseMetaSystem[targetCode];
  syncPhaseView(targetCode);

  const bpmSlider = document.getElementById('bpm-slider');
  if (bpmSlider) {
    bpmSlider.min = meta.minBpm;
    bpmSlider.max = meta.maxBpm;
    bpmSlider.value = meta.baseBpm;
  }
  adjustVelocity(meta.baseBpm);

  document.querySelectorAll('.phase-card').forEach((card) => {
    card.classList.toggle('is-current', card.dataset.phase === phaseLabel);
  });

  populateGenreExplorer(targetCode);
  safeVibrate(15);
  showScreen('screen-refine');
}

function populateGenreExplorer(phaseInteger) {
  const grid = document.getElementById('genre-bento-explorer');
  if (!grid) return;
  grid.innerHTML = '';

  const pool = absoluteGenreMatrix.filter((genre) => genre.phase === phaseInteger);
  if (pool.length > 0) selectedGenreCode = pool[0].code;

  pool.forEach((genre, index) => {
    const tile = document.createElement('div');
    tile.className = `genre-card ${index === 0 ? 'selected' : ''}`;
    tile.id = `genre-tile-${genre.code}`;
    tile.innerHTML = `<h4>${genre.name}</h4><span>CODE: ${genre.code}</span>`;
    tile.onclick = () => {
      document.querySelectorAll('.genre-card').forEach((card) => card.classList.remove('selected'));
      tile.classList.add('selected');
      selectedGenreCode = genre.code;
      safeVibrate(10);
    };
    grid.appendChild(tile);
  });
}

function setAtmosphere(mood) {
  updateSegmentActiveState('ctrl-atmosphere', mood);
  selectedAtmosphere = mood;
}

function setVocalStyle(style) {
  updateSegmentActiveState('ctrl-vocals', style);
  selectedVocalStyle = style === 'off' ? null : style;
}

function updateSegmentActiveState(parentId, matchingText) {
  const container = document.getElementById(parentId);
  if (!container) return;

  container.querySelectorAll('.seg-btn').forEach((button) => {
    button.classList.remove('active');
    if (button.innerText.toLowerCase().includes(matchingText.toLowerCase())) {
      button.classList.add('active');
    }
  });
}

function adjustVelocity(bpmValue) {
  currentVelocityBpm = parseInt(bpmValue, 10);
  const counter = document.getElementById('bpm-live-counter');
  if (counter) counter.innerText = `${bpmValue} BPM`;
}

function buildNodePayload() {
  const targetMeta = phaseMetaSystem[selectedPhaseNum];
  return {
    phase: targetMeta.apiLabel,
    atmosphere: selectedAtmosphere,
    artistSeed: '90s UK jungle and garage lineage',
    artist_seed: '90s UK jungle and garage lineage',
    bpm: currentVelocityBpm,
    vocal_style: selectedVocalStyle,
    genre_code: selectedGenreCode,
  };
}

function buildFastApiPayload() {
  return {
    phase: selectedPhaseNum,
    atmosphere: selectedAtmosphere,
    bpm: currentVelocityBpm,
    vocal_style: selectedVocalStyle,
    genre_code: selectedGenreCode,
    artist_seed: '90s UK jungle and garage lineage',
  };
}

async function postConductPayload(body) {
  const response = await fetch('/api/conduct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  return { response, payload };
}

function extractAudioPayload(payload) {
  const nodeAudio = payload?.audioData;
  const pythonAudio = payload?.audio_data;

  if (typeof nodeAudio === 'string') {
    return {
      data: nodeAudio,
      mimeType: payload?.mimeType || payload?.mime_type || 'audio/wav',
    };
  }

  if (typeof pythonAudio === 'string') {
    return {
      data: pythonAudio,
      mimeType: payload?.mime_type || payload?.mimeType || 'audio/wav',
    };
  }

  return {
    data: nodeAudio?.data || pythonAudio?.data || '',
    mimeType: nodeAudio?.mimeType || pythonAudio?.mimeType || payload?.mime_type || payload?.mimeType || 'audio/wav',
  };
}

// Bilingual adaptive handshake: Node first for the active cPanel surface, FastAPI fallback for the canonical migration path.
async function triggerNeuralHandshake() {
  if (isGeneratingActive) return;
  isGeneratingActive = true;
  meshPulseState = 0.5;

  showScreen('screen-cockpit');
  const logs = document.getElementById('lyrics-stream');
  if (logs) logs.innerText = 'INITIALIZING ARCHITECTURE MATRIX...';

  try {
    let { response, payload } = await postConductPayload(buildNodePayload());

    // FastAPI rejects the string phase used by Node. Retry with the integer contract only in that case.
    if (response.status === 422) {
      ({ response, payload } = await postConductPayload(buildFastApiPayload()));
    }

    if (!response.ok) throw new Error(payload?.error || payload?.detail || 'Neural contract mapping failed.');

    const trackMeta = document.getElementById('meta-track-id');
    const genreMeta = document.getElementById('meta-genre-arch');
    if (trackMeta) trackMeta.innerText = payload.track_id || payload.trackId || 'SYNC_001';
    if (genreMeta) genreMeta.innerText = payload.name || selectedGenreCode || 'London Legend Stream';

    const { data: rawDataBase64, mimeType } = extractAudioPayload(payload);

    if (rawDataBase64) {
      const audioEl = document.getElementById('generated-audio');
      if (audioEl) {
        audioEl.src = `data:${mimeType};base64,${rawDataBase64}`;
        await audioEl.play().catch(() => console.log('Audio stream initialized.'));
      }
    }

    if (logs) logs.innerText = payload.lyrics || payload.message || 'Synthesis complete. Output active.';
    meshPulseState = payload.waveform || rawDataBase64 ? 1 : 0.35;
  } catch (error) {
    if (logs) logs.innerText = `INTERFACE ERROR: ${error.message}`;
    meshPulseState = 0;
  } finally {
    isGeneratingActive = false;
  }
}

function openRefineScreen() {
  populateGenreExplorer(selectedPhaseNum);
  showScreen('screen-refine');
}

function abortSession() {
  const audio = document.getElementById('generated-audio');
  if (audio) {
    audio.pause();
    audio.src = '';
  }
  showScreen('screen-dashboard');
}

function incrementEggCounter() {
  eggClickCounter += 1;
  if (eggClickCounter >= 7) {
    engageEasterEgg();
    eggClickCounter = 0;
  }
}

function engageEasterEgg() {
  safeVibrate([100, 50, 100]);
  alert(
    'THE CHRONICLES OF DUKEBOX:\n\n'
      + 'Seeded with the DNA of the London Underground. Synthesized by Google DeepMind Lyria 3.\n\n'
      + 'Authorized for Private Gift Deployment.',
  );
}

// Visualizer Canvas Loop
const canvasElement = document.getElementById('neural-mesh');
const canvasContext = canvasElement?.getContext('2d');
let linearPulseTicker = 0;

function animationTickLoop() {
  if (!canvasElement || !canvasContext) return;

  const width = canvasElement.clientWidth;
  const height = canvasElement.clientHeight;
  if (canvasElement.width !== width || canvasElement.height !== height) {
    canvasElement.width = width;
    canvasElement.height = height;
  }

  canvasContext.clearRect(0, 0, width, height);
  canvasContext.lineWidth = 1.5;
  canvasContext.strokeStyle = 'rgba(0, 230, 242, 0.4)';
  canvasContext.beginPath();

  for (let x = 0; x < width; x += 20) {
    const offset = Math.sin(linearPulseTicker + x * 0.04) * (20 * meshPulseState);
    canvasContext.moveTo(x, height / 2 + offset);
    canvasContext.lineTo(
      x + 20,
      height / 2 + Math.sin(linearPulseTicker + (x + 20) * 0.04) * (20 * meshPulseState),
    );
  }

  canvasContext.stroke();
  linearPulseTicker += 0.04;
  requestAnimationFrame(animationTickLoop);
}

window.showScreen = showScreen;
window.selectPhase = selectPhase;
window.setAtmosphere = setAtmosphere;
window.setVocalStyle = setVocalStyle;
window.adjustVelocity = adjustVelocity;
window.triggerNeuralHandshake = triggerNeuralHandshake;
window.openRefineScreen = openRefineScreen;
window.abortSession = abortSession;
window.incrementEggCounter = incrementEggCounter;

syncPhaseView(selectedPhaseNum);
populateGenreExplorer(selectedPhaseNum);
adjustVelocity(currentVelocityBpm);
animationTickLoop();
