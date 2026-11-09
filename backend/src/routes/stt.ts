// backend/src/routes/stt.ts: Route handler for POST /api/stt transcribing speech using Gnani STT

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { transcribeAudio } from '../lib/gnani';

const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (30 seconds of audio is < 5MB)
  },
});

const router = Router();

// POST /api/stt
router.post('/', upload.single('audio'), async (req: Request, res: Response) => {
  try {
    let audioBuffer: Buffer | null = null;
    let filename = 'audio.wav';

    if (req.file && req.file.buffer) {
      audioBuffer = req.file.buffer;
      filename = req.file.originalname || filename;
    } else if (req.body?.audioBase64) {
      const base64Data = req.body.audioBase64.replace(/^data:audio\/\w+;base64,/, '');
      audioBuffer = Buffer.from(base64Data, 'base64');
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return res.status(400).json({ error: 'No audio provided in request' });
    }

    const languageCode = typeof req.body?.languageCode === 'string' ? req.body.languageCode : 'en-IN';
    const result = await transcribeAudio(audioBuffer, filename, languageCode);
    return res.json({
      success: true,
      transcript: result.transcript,
      detectedLanguage: result.detectedLanguage,
      model: result.model,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown STT error';
    console.error('STT route error:', message);
    return res.status(500).json({ error: message });
  }
});

export default router;
