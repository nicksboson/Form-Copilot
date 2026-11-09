# agent.md: Form Copilot build rules

## 1. Purpose
Chrome extension (Manifest V3) that reads a Google Form (`https://docs.google.com/forms/*`) top to bottom, builds a structured snapshot, and helps a Hindi-speaking user understand the form and draft English answers. Voice in and voice out use Gnani. The LLM is Groq's `openai/gpt-oss-120b` (verify the exact model ID in Groq's model list before first use). Fill fields only after the user confirms.

Scope v1: Google Forms only. No other sites.

## 2. Stack (do not change without asking)
- Extension: React 18, TypeScript, Vite, Tailwind CSS, @crxjs/vite-plugin, Manifest V3.
- Backend: Node.js 20+, Express, TypeScript, zod.
- Shared: zod schemas in `shared/` imported by both extension and backend.
- Tests: Vitest (unit), Playwright (end-to-end on fixtures).
- Do not add other dependencies without asking. State the reason in one sentence.

## 3. Hard rules (never violate)
1. Never click Submit, Next, Back, or any navigation button in reader mode.
2. Never fill a field without explicit user confirmation in the side panel.
3. Never overwrite a field that already has a value.
4. Never insert mock data into a live form. Mock data is for fixtures only.
5. API keys (Groq, Gnani) live only in the backend `.env`. Never in the extension, manifest, content scripts, fixtures, logs, or git.
6. The extension calls only its own backend URL. It never calls Groq or Gnani directly.
7. Content scripts never call the backend. Only the background worker and the side panel do.
8. Manifest permissions: `storage`, `sidePanel`, host `https://docs.google.com/forms/*`, and the backend origin. Nothing else.
9. No `eval`, `new Function`, or inline scripts.
10. No `localStorage` or `sessionStorage` in the extension. Use `chrome.storage.local` for settings only. Form snapshots stay in memory.
11. Never read or store anything outside the active Google Form tab.
12. Never guess Google Forms selectors or Gnani/Groq request shapes. Check the docs or ask.

## 4. Gnani API rules
- Base URL: `https://api.vachana.ai`. Auth header: `X-API-Key-ID: <key>`.
- Before writing any Gnani call, open `https://docs.gnani.ai/llms.txt` and read the page for the exact endpoint, request body, and response shape. Do not assume paths.
- STT: REST, model `prisma-v3.0` for auto language detection; fall back to `prisma-v2.5` with `language_code` if v3 fails. Clips must be 30 seconds or less.
- TTS: Timbre v2.5 REST. Do not use v2.0.
- Backend returns only the text or audio the extension needs. It never forwards raw Gnani errors containing keys.

## 5. Groq API rules
- Use Groq's OpenAI-compatible chat completions endpoint. Verify the URL and the `response_format` option in Groq's docs before coding.
- Request JSON output for every structured reply. Validate the response with zod. On failure, retry once with a stricter instruction, then show an error.
- Set a request timeout (30 seconds) and a max token limit.
- Trim the snapshot to a token budget. Always keep required questions in full.

## 6. Form reading rules
- Two modes. FULL: parse the embedded data from the script containing `FB_PUBLIC_LOAD_DATA_`. PARTIAL: scan the visible page and add pages as the user moves through the form.
- Scroll in steps of about 80% of the viewport. Stop at the bottom when page height is stable for 3 checks. Cap at 200 rounds. Restore scroll position.
- Show progress in an overlay. Remove it in `finally`.
- Keep every Google Forms selector and internal key in `extension/src/content/selectors.ts`. Nowhere else.
- Prefer `role`, `aria-*`, input type, and label text over class names.
- Snapshots must pass the zod schema in `shared/schema.ts` before they are stored.

## 7. Engineering rules
- Every loop has a cap. Every async path has try/catch and a readable error in the panel with a retry button.
- Keep files under about 250 lines. One responsibility per file. Header comment on each file.
- Typed messages only. Message type names come from `shared/messages.ts`.
- No emojis in UI or code. UI text is Hindi for user-facing strings, English for developer strings.
- Do not refactor outside the current task.

## 8. Failure behaviour
- Selector finds nothing: add a warning to the snapshot. Do not invent a question.
- Embedded data missing or invalid: switch to PARTIAL mode and add a warning.
- Groq or Gnani fails: show the error and a retry button. Never guess an answer.
- Field cannot be filled: report the question ID and the reason.
- Unsure: stop, give at most three options in plain language, and ask the user to choose.

## 9. Working method
- Before each task, list the files you will change (max 10 bullets).
- After each task, report: files changed, what was tested, what failed, what is open.
- Do not claim a feature works unless it was tested on a fixture or confirmed by the user.
- Ideas outside the current scope go in a "Future ideas" list, not in the code.

## 10. Stop-and-ask triggers
- A required Google Forms structure is missing from the fixtures.
- A Gnani or Groq endpoint or model ID cannot be confirmed from the docs.
- A change needs a new permission or dependency.
- A check fails twice in a row.
- A request conflicts with a hard rule.

## 11. Done means
1. Files exist and follow sections 2 to 7.
2. Acceptance checks pass on the fixtures and on the user's test form.
3. No hard rule is violated.
4. The grep for the Groq and Gnani key strings across the repo returns zero matches outside `.env` (which is git-ignored).