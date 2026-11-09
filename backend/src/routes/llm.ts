// backend/src/routes/llm.ts: Route handler for POST /api/llm generating summaries and conversation replies

import { Router, Request, Response } from 'express';
import {
  FormSnapshotSchema,
  FormSummarySchema,
  ConversationReplySchema,
  FormSnapshot,
} from 'form-copilot-shared';
import { callGroqStructured, trimSnapshot } from '../lib/groq';

const router = Router();

// POST /api/llm
router.post('/', async (req: Request, res: Response) => {
  try {
    const { type, snapshot, question, contextQuestionId, history } = req.body;

    if (!type || (type !== 'summary' && type !== 'conversation')) {
      return res.status(400).json({
        error: 'Invalid request: "type" must be either "summary" or "conversation"',
      });
    }

    const validatedSnapshot = FormSnapshotSchema.parse(snapshot);
    const trimmed = trimSnapshot(validatedSnapshot);

    if (type === 'summary') {
      const userLanguage =
        typeof req.body?.languageName === 'string' && req.body.languageName.trim()
          ? req.body.languageName.trim()
          : 'English';

      const summaryPrompt = `
You are Form Copilot, an AI assistant helping a user understand a Google Form.
The user's selected language is: ${userLanguage}.
Analyze the following form snapshot and generate a helpful, comprehensive summary written ENTIRELY in ${userLanguage}.

Form Snapshot:
${JSON.stringify(trimmed, null, 2)}

Respond with a JSON object matching this schema:
{
  "purpose": "A clear explanation in ${userLanguage} of what this form is for",
  "pageCount": ${trimmed.pages.length},
  "requiredQuestions": ["List of mandatory questions translated or phrased in ${userLanguage}"],
  "requiredDocuments": ["List of documents or file uploads required in ${userLanguage}, or empty array if none"],
  "branching": "Explanation in ${userLanguage} of any section branching or conditions (e.g. Q5 branching to page 3), or 'None' if none",
  "overviewHi": "A welcoming, easy-to-understand overview in natural ${userLanguage} explaining what the user needs to do"
}
`;

      const result = await callGroqStructured(
        [
          {
            role: 'system',
            content: `You are an expert form assistant. Generate all strings in the response strictly in ${userLanguage}. Output valid JSON only.`,
          },
          { role: 'user', content: summaryPrompt },
        ],
        FormSummarySchema
      );

      return res.json({ success: true, data: result });
    }

    if (type === 'conversation') {
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Missing user question' });
      }

      const userLanguage =
        typeof req.body?.languageName === 'string' && req.body.languageName.trim()
          ? req.body.languageName.trim()
          : 'English';

      const historyFormatted =
        Array.isArray(history) && history.length > 0
          ? history
              .slice(-6)
              .map((h: { role?: string; text?: string }) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text || ''}`)
              .join('\n')
          : 'None';

      const conversationPrompt = `
You are Form Copilot, a highly interactive, friendly AI assistant helping a user fill out and understand a Google Form.
The user's preferred language is: ${userLanguage}.

User's Latest Query: "${question}"
${contextQuestionId ? `Currently focused on Question ID or Title: "${contextQuestionId}"` : ''}

Recent Conversation History:
${historyFormatted}

Form Snapshot:
${JSON.stringify(trimmed, null, 2)}

Instructions:
1. Understand the user's intent:
   - Detect if the user wants to start form filling (e.g. "move to form filling", "start filling", "form bharo", "let's fill").
   - Detect if the user says they completed a manual field (e.g. "done", "ho gaya", "kar diya", "completed").
   - If they are answering a question or asking to fill a field: identify which question in the form they are referring to. In "questionId", put the exact "id" or "title" of that question from the Form Snapshot.
   - If they are asking for general advice, form explanation, or clarification: set "questionId" to the relevant question if applicable, or null if general.
2. In "explanationHi":
   - YOU MUST RESPOND STRICTLY IN ${userLanguage.toUpperCase()}.
   - If the user's selected language is English, do NOT use Hindi or any non-English words. Every word of explanation, advice, and greetings MUST be in English.
   - Answer their query thoroughly and politely.
3. In "options":
   - If drafting answers for a field:
     * For simple direct fields (such as Full Name, Phone number, Email address, City, or when the user provided a straightforward single answer): return EXACTLY 1 option in "options".
     * For "big data" or complex fields (paragraph questions, self description, motivation/reason to join, skills list, or multiple choice): return 2 or 3 distinct well-drafted options in "options" (e.g. concise, balanced, detailed variations) so the user can select their preferred choice.
     * Each option must have:
       - "en": The drafted English answer suitable for the field. If multiple choice/checkboxes, "en" MUST match an available option text.
       - "hi": The exact meaning or explanation in ${userLanguage} so the user understands what they are choosing.
   - If the user's query is purely conversational, general inquiry, or no fillable draft is needed: return an empty array: []

Output format (valid JSON only):
{
  "questionId": "string or null",
  "explanationHi": "response message strictly in ${userLanguage}",
  "options": [
    { "en": "Drafted English value", "hi": "meaning or explanation in ${userLanguage}" }
  ]
}
`;

      const result = await callGroqStructured(
        [
          {
            role: 'system',
            content: `You are an expert form assistant conversing STRICTLY in ${userLanguage}. All explanations MUST be exclusively in ${userLanguage}. Output valid JSON only with maximum 3 options.`,
          },
          { role: 'user', content: conversationPrompt },
        ],
        ConversationReplySchema
      );

      return res.json({ success: true, data: result });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown LLM error';
    console.error('LLM route error:', message);
    return res.status(500).json({ error: message });
  }
});

export default router;
