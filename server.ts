import express from 'express';
import path from 'node:path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const port = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
const app = express();

const PHASES = [
  {
    code: 1,
    name: 'PEAK-BASS',
    vibe: 'Peak Hour & Heavy Bass',
    color: '#EA00F2',
    bg: '#0A0A0F',
    bpm_range: [140, 180],
    description: 'Warehouse techno at peak intensity. Neurofunk, hard techno, dubstep, jungle.',
  },
  {
    code: 2,
    name: 'MAIN-FLOOR',
    vibe: 'Groove & Flow',
    color: '#00E6F2',
    bg: '#0A0A0F',
    bpm_range: [120, 140],
    description: 'Deep house, tech house, UK garage, melodic techno. The steady groove.',
  },
  {
    code: 3,
    name: 'SUNRISE',
    vibe: 'The Transition',
    color: '#A7C7E7',
    bg: '#0F0F1A',
    bpm_range: [100, 128],
    description: 'Organic house, balearic beat, breakbeat, future garage. Dawn is breaking.',
  },
  {
    code: 4,
    name: 'ZONED-OUT',
    vibe: 'Chilled After-Party',
    color: '#E9967A',
    bg: '#1A1610',
    bpm_range: [60, 100],
    description: 'Trip-hop, downtempo, ambient dub, lo-fi. The contemplative after-hours.',
  },
];

const GENRES = [
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
  { code: "H-22", name: "Jackin' House", phase: 2, bpm: [124, 130] },
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

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', project: 'The DukeBox of London' });
});

app.get('/api/phases', (_req, res) => {
  res.json(PHASES);
});

app.get('/api/genres', (req, res) => {
  const phase = req.query.phase ? Number(req.query.phase) : null;
  res.json(phase ? GENRES.filter((genre) => genre.phase === phase) : GENRES);
});

app.get('/api/genres/:code', (req, res) => {
  const genre = GENRES.find((item) => item.code.toLowerCase() === req.params.code.toLowerCase());
  if (!genre) {
    res.status(404).json({ error: 'Genre not found' });
    return;
  }
  res.json(genre);
});

app.get('/api/stats', (_req, res) => {
  res.json({
    total_tracks: 0,
    loved: 0,
    pinned: 0,
    phase_counts: { 1: 0, 2: 0, 3: 0, 4: 0 },
    session_cost: 0,
  });
});

app.post('/api/conduct', async (req, res) => {
  const { phase, atmosphere, artistSeed } = req.body ?? {};

  if (!ai) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured.',
      message: 'Set GEMINI_API_KEY in cPanel Node.js environment variables.',
    });
    return;
  }

  try {
    const prompt = [
      `Generate a ${phase || 'main-floor'} electronic track.`,
      `Atmosphere: ${atmosphere || 'warehouse pulse'}.`,
      `Artist seed: ${artistSeed || 'London club lineage'}.`,
      'Style: London warehouse, DJ-friendly transitions, detailed low end.',
    ].join(' ');

    const result = await ai.models.generateContent({
      model: 'lyria-3-pro-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseModalities: ['AUDIO', 'TEXT'],
        responseMimeType: 'audio/wav',
      },
    });

    const candidate = result.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];
    const audioPart = parts.find((part) => part.inlineData?.data);
    const textPart = parts.find((part) => typeof part.text === 'string');

    if (!audioPart?.inlineData?.data) {
      res.status(502).json({
        error: 'No audio payload returned by model.',
      });
      return;
    }

    res.json({
      audioData: audioPart.inlineData,
      lyrics: textPart?.text ?? 'Instrumental stream generated.',
    });
  } catch (error) {
    console.error('Conduct endpoint failed:', error);
    res.status(500).json({
      error: 'Neural Buffer Error: Transition Failed.',
    });
  }
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`DukeBox Node.js server live on port ${port}`);
  });
}

export = app;
