// tests/unit/schema.test.ts: Vitest unit tests for Zod schemas (Snapshot, LLM replies, Fill results)

import { describe, it, expect } from 'vitest';
import {
  FormSnapshotSchema,
  ConversationReplySchema,
  FormSummarySchema,
  FillResultSchema,
  FormSnapshot,
} from 'form-copilot-shared';

describe('Zod Schema Validations', () => {
  it('validates a correct FormSnapshot', () => {
    const validSnapshot: FormSnapshot = {
      formTitle: 'Customer Feedback',
      mode: 'FULL',
      pages: [
        {
          index: 0,
          title: 'Page 1',
          questions: [
            {
              id: 'q1',
              title: 'Full Name',
              type: 'text',
              required: true,
              pageIndex: 0,
            },
          ],
        },
      ],
      warnings: [],
      scannedAt: new Date().toISOString(),
    };

    const parsed = FormSnapshotSchema.safeParse(validSnapshot);
    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid FormSnapshot with invalid question type', () => {
    const invalidSnapshot = {
      formTitle: 'Bad Form',
      mode: 'FULL',
      pages: [
        {
          index: 0,
          questions: [
            {
              id: 'q1',
              title: 'Question',
              type: 'invalid_type_not_supported',
              required: true,
              pageIndex: 0,
            },
          ],
        },
      ],
      warnings: [],
      scannedAt: new Date().toISOString(),
    };

    const parsed = FormSnapshotSchema.safeParse(invalidSnapshot);
    expect(parsed.success).toBe(false);
  });

  it('validates ConversationReply with at most 3 options', () => {
    const validReply = {
      questionId: 'q1',
      explanationHi: 'यह प्रश्न आपके नाम के लिए है।',
      options: [
        { en: 'Nikhil Kumar', hi: 'निखिल कुमार' },
        { en: 'John Doe', hi: 'जॉन डो' },
      ],
    };

    const parsed = ConversationReplySchema.safeParse(validReply);
    expect(parsed.success).toBe(true);
  });

  it('rejects ConversationReply with more than 3 options', () => {
    const invalidReply = {
      questionId: 'q1',
      explanationHi: 'बहुत सारे विकल्प',
      options: [
        { en: 'Opt 1', hi: 'विकल्प 1' },
        { en: 'Opt 2', hi: 'विकल्प 2' },
        { en: 'Opt 3', hi: 'विकल्प 3' },
        { en: 'Opt 4', hi: 'विकल्प 4' },
      ],
    };

    const parsed = ConversationReplySchema.safeParse(invalidReply);
    expect(parsed.success).toBe(false);
  });

  it('validates FormSummary schema', () => {
    const validSummary = {
      purpose: 'ग्राहक प्रतिक्रिया एकत्रित करना',
      pageCount: 3,
      requiredQuestions: ['पूरा नाम', 'ईमेल'],
      requiredDocuments: ['पहचान पत्र'],
      branching: 'प्रश्न 5 के उत्तर के आधार पर पृष्ठ 3 पर जाएं',
      overviewHi: 'कृपया इस फ़ॉर्म के सभी अनिवार्य प्रश्न ध्यानपूर्वक भरें।',
    };

    const parsed = FormSummarySchema.safeParse(validSummary);
    expect(parsed.success).toBe(true);
  });

  it('validates FillResult status constraints', () => {
    const validResult = {
      questionId: 'q1',
      success: true,
      status: 'filled' as const,
      message: 'Field filled successfully',
      readValue: 'Nikhil',
    };

    expect(FillResultSchema.safeParse(validResult).success).toBe(true);

    const invalidStatus = {
      questionId: 'q1',
      success: true,
      status: 'non_existent_status',
      message: 'Status test',
    };

    expect(FillResultSchema.safeParse(invalidStatus).success).toBe(false);
  });
});
