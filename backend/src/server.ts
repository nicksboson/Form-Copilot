// backend/src/server.ts: Express server initialization, middleware setup, and route mounting

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend or root directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import llmRouter from './routes/llm';
import sttRouter from './routes/stt';
import ttsRouter from './routes/tts';

export const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration to permit Chrome extension origins and local dev
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or extension background scripts)
      if (!origin) return callback(null, true);
      if (
        origin.startsWith('chrome-extension://') ||
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const hasGroq = Boolean(process.env.GROQ_API_KEY || process.env.GROQ_API);
  const hasGnani = Boolean(process.env.GNANI_API_KEY || process.env.GNANI_API);
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Form Copilot Backend',
    configured: {
      groq: hasGroq,
      gnani: hasGnani,
    },
  });
});

// Mount API routes
app.use('/api/llm', llmRouter);
app.use('/api/stt', sttRouter);
app.use('/api/tts', ttsRouter);

// Global error handling middleware
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  console.error('Unhandled server error:', message);
  res.status(500).json({ error: message });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Form Copilot backend running on port ${PORT}`);
  });
}
