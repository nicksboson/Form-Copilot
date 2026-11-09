// tests/unit/embedded.test.ts: Vitest unit test for embedded parser verifying 3 pages (5, 4, 5 questions) and Q5 branching on Form B

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { extractEmbeddedScriptData, parseEmbeddedFormSnapshot } from '../../extension/src/content/embedded';
import { FormSnapshotSchema } from 'form-copilot-shared';

describe('Embedded Google Forms Parser (FULL Mode)', () => {
  it('parses Form B fixture into 3 pages with 5, 4, 5 questions and marks Q5 as branching', () => {
    const fixturePath = path.resolve(__dirname, '../fixtures/form-b-multi-page.html');
    const htmlContent = fs.readFileSync(fixturePath, 'utf-8');

    const rawData = extractEmbeddedScriptData(htmlContent);
    expect(rawData).not.toBeNull();
    expect(Array.isArray(rawData)).toBe(true);

    const snapshot = parseEmbeddedFormSnapshot(rawData!);

    // Validate structure matches Zod schema
    const validated = FormSnapshotSchema.parse(snapshot);
    expect(validated.mode).toBe('FULL');
    expect(validated.formTitle).toBe('Form B Multi-Page Application');

    // Acceptance Check 3: Form B FULL mode: 3 pages with 5, 4, 5 questions; branch marked on Q5
    expect(validated.pages.length).toBe(3);
    expect(validated.pages[0].questions.length).toBe(5);
    expect(validated.pages[1].questions.length).toBe(4);
    expect(validated.pages[2].questions.length).toBe(5);

    // Verify Q5 has branching marked
    const q5 = validated.pages[0].questions[4];
    expect(q5.title).toBe('Do you have prior technical experience?');
    expect(q5.isBranching).toBe(true);
  });
});
