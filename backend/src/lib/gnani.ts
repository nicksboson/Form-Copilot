// backend/src/lib/gnani.ts: Client for Gnani STT (Prisma v3.0 / v2.5 fallback) and TTS (Timbre v2.5)

const GNANI_BASE_URL = 'https://api.vachana.ai';

function getApiKey(): string {
  const key = process.env.GNANI_API_KEY || process.env.GNANI_API;
  if (!key) {
    throw new Error('Gnani API key is missing in environment variables');
  }
  return key;
}

function sanitizeError(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  // Redact any potential API key tokens
  const clean = message.replace(/[a-zA-Z0-9_-]{20,}/g, (match) => {
    const key = process.env.GNANI_API_KEY || process.env.GNANI_API;
    return key && match.includes(key) ? '[REDACTED]' : match;
  });
  return new Error(clean);
}

export interface TranscribeResult {
  transcript: string;
  detectedLanguage?: string;
  model: string;
}

// Transcribe audio using Prisma v3.0 with automatic language detection, fallback to Prisma v2.5
export async function transcribeAudio(
  audioBuffer: Buffer,
  filename = 'audio.wav',
  languageCode = 'en-IN'
): Promise<TranscribeResult> {
  const apiKey = getApiKey();
  const effectiveLang = languageCode || 'en-IN';

  // Try Prisma v3.0 first with provided languageCode
  try {
    const form = new FormData();
    const uint8Array = new Uint8Array(audioBuffer);
    const blob = new Blob([uint8Array], { type: 'audio/wav' });
    form.append('audio_file', blob, filename);
    form.append('model', 'prisma-v3.0');
    form.append('language_code', effectiveLang);
    form.append('format', 'transcribe');

    const res = await fetch(`${GNANI_BASE_URL}/stt/v3`, {
      method: 'POST',
      headers: {
        'X-API-Key-ID': apiKey,
      },
      body: form,
    });

    if (res.ok) {
      const data = (await res.json()) as {
        success?: boolean;
        transcript?: string;
        model?: string;
        detected_language_code?: string;
      };
      if (data.success && typeof data.transcript === 'string') {
        return {
          transcript: data.transcript,
          detectedLanguage: data.detected_language_code || effectiveLang,
          model: data.model || 'prisma-v3.0',
        };
      }
    }
  } catch (err) {
    // If Prisma v3.0 fails, proceed to Prisma v2.5 fallback
    console.warn('Gnani STT Prisma v3.0 attempt failed, falling back to v2.5:', sanitizeError(err).message);
  }

  // Fallback to Prisma v2.5 with selected language
  try {
    const fallbackForm = new FormData();
    const uint8Array = new Uint8Array(audioBuffer);
    const blob = new Blob([uint8Array], { type: 'audio/wav' });
    fallbackForm.append('audio_file', blob, filename);
    fallbackForm.append('model', 'prisma-v2.5');
    fallbackForm.append('language_code', effectiveLang);
    fallbackForm.append('format', 'transcribe');

    const fallbackRes = await fetch(`${GNANI_BASE_URL}/stt/v3`, {
      method: 'POST',
      headers: {
        'X-API-Key-ID': apiKey,
      },
      body: fallbackForm,
    });

    if (!fallbackRes.ok) {
      const errText = await fallbackRes.text().catch(() => '');
      throw new Error(`Gnani STT v2.5 failed with status ${fallbackRes.status}: ${errText}`);
    }

    const data = (await fallbackRes.json()) as {
      success?: boolean;
      transcript?: string;
      model?: string;
    };

    if (data.success && typeof data.transcript === 'string') {
      return {
        transcript: data.transcript,
        detectedLanguage: effectiveLang,
        model: data.model || 'prisma-v2.5',
      };
    }

    throw new Error('Gnani STT response indicated unsuccessful transcription');
  } catch (err) {
    throw sanitizeError(err);
  }
}

// Synthesize speech using Timbre v2.5 REST endpoint
export async function synthesizeSpeech(
  text: string,
  speed = 1.0,
  language = 'en-IN'
): Promise<Buffer> {
  const apiKey = getApiKey();

  try {
    const res = await fetch(`${GNANI_BASE_URL}/api/v1/tts/inference`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key-ID': apiKey,
      },
      body: JSON.stringify({
        text,
        voice: 'Nalini',
        model: 'timbre-v2.5',
        language: language || 'en-IN',
        speed,
        audio_config: {
          encoding: 'linear_pcm',
          container: 'wav',
          num_channels: 1,
          sample_rate: 48000,
          sample_width: 2,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Gnani TTS failed with status ${res.status}: ${errText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    throw sanitizeError(err);
  }
}
