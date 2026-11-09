// backend/src/routes/tts.ts: Route handler for POST /api/tts synthesizing speech using Gnani Timbre v2.5

import { Router, Request, Response } from 'express';
import { synthesizeSpeech } from '../lib/gnani';

const router = Router();

// POST /api/tts
router.post('/', async (req: Request, res: Response) => {
  try {
    const { text, speed, language } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid "text" field' });
    }

    const audioBuffer = await synthesizeSpeech(
      text,
      typeof speed === 'number' ? speed : 1.0,
      typeof language === 'string' ? language : 'en-IN'
    );

    res.set({
      'Content-Type': 'audio/wav',
      'Content-Length': audioBuffer.length.toString(),
    });

    return res.send(audioBuffer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown TTS error';
    console.error('TTS route error:', message);
    return res.status(500).json({ error: message });
  }
});

export default router;
