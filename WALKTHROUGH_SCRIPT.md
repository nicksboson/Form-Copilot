# Form Copilot: Technical Walkthrough Video Script

**Target Duration**: 2 minutes 30 seconds to 3 minutes  
**Estimated Spoken Pace**: 135 to 145 words per minute (~350-380 words total)  
**Style**: Direct, engineering-focused, high technical depth  
**Target Audience**: Developers, technical evaluators, and product engineers  

---

## Storyboard & Script Breakdown

### Scene 1: The Engineering Challenge (0:00 - 0:25)

- **Duration**: 25 seconds
- **Visual**: Screen capture of a complex Google Form with multiple sections, branching questions, and native controls. Open Chrome DevTools to show the dense, obfuscated DOM structure (`data-params`, JSAction, Google Wiz/Closure components).
- **On-Screen Overlay**: 
  - Obstacle 1: Obfuscated Google Wiz Framework
  - Obstacle 2: Linguistic Accessibility & Native Dialects
  - Solution: Form Copilot (Chrome Manifest V3 Side Panel + Local AI Service)

**Narration**:
> "Web forms remain one of the most critical data entry points on the internet, yet for non-native speakers or users facing complex questionnaires, they present massive cognitive friction. 
> 
> Automating and assisting with Google Forms is notoriously difficult because Google renders them using the proprietary Google Wiz and Closure frameworks. Form fields are deeply obfuscated, native values do not bind to standard DOM mutations, and branching logic is buried inside serialized script payloads.
> 
> Form Copilot solves this with a Manifest V3 Chrome Extension powered by dual-mode DOM parsing, Groq's high-throughput LLaMA-based reasoning engine, and Gnani's native Indian voice AI."

---

### Scene 2: Dual-Mode Ingestion Pipeline (0:25 - 0:55)

- **Duration**: 30 seconds
- **Visual**: Show Form Copilot opening in Chrome's Side Panel. Click "Diagnostics" to reveal the raw `FormSnapshot`. Switch to DevTools Sources tab and highlight the inline script containing `FB_PUBLIC_LOAD_DATA_`. Show how the entire questionnaire across all pages is populated instantaneously.
- **On-Screen Overlay**:
  - FULL Mode: `FB_PUBLIC_LOAD_DATA_` AST Extraction
  - PARTIAL Mode: Controlled Viewport Scanner (80% steps, 200 cap)
  - Schema: Zod `FormSnapshotSchema`

**Narration**:
> "To ingest the form, Form Copilot implements a dual-mode strategy.
> 
> In FULL mode, our content script intercepts Google Forms' embedded runtime array located inside the `FB_PUBLIC_LOAD_DATA_` script tag. By parsing this serialized structure, we extract the complete schema—including hidden pages, validation regexes, question IDs, and conditional branching rules—without requiring the user to navigate through the form.
> 
> If the script payload is stripped or modified, the extension automatically falls back to PARTIAL mode: a progressive viewport scanner that scrolls in calibrated 80-percent steps with strict loop bounds, extracting visible DOM cards and restoring the user's scroll position cleanly.
> 
> Every extracted snapshot is validated against a strict Zod contract before passing to the AI layer."

---

### Scene 3: Multilingual Voice Engine & AI Reasoning (0:55 - 1:40)

- **Duration**: 45 seconds
- **Visual**: In the Side Panel, select Hindi (or Tamil/Telugu) from the language selector. Click "Start Voice". Show the pulsing radar aura animation. Speak a response into the microphone. Show the live transcription appearing, followed by the assistant responding both in text and spoken audio. Show candidate suggestions rendered in the side panel for multiple-choice questions.
- **On-Screen Overlay**:
  - Audio: 16 kHz Mono WAV PCM
  - STT: Gnani Prisma v3.0 (Dialect Auto-Detect & Fallback)
  - LLM: Groq `openai/gpt-oss-120b` (Strict JSON Mode)
  - TTS: Gnani Timbre v2.5

**Narration**:
> "Form Copilot features an end-to-end voice and reasoning loop designed for native Indian languages.
> 
> When the user initiates voice filling, our MediaRecorder streams 16-kilohertz mono WAV audio directly to our local backend. The backend dispatches it to Gnani Prisma STT, which isolates native dialects across Hindi, Tamil, Telugu, and five other regional languages.
> 
> The transcription is paired with the form's active snapshot and token-budgeted question context, then forwarded to Groq's OpenAI-compatible completions API running `gpt-oss-120b`. 
> 
> Groq returns structured JSON instructing whether to answer queries, navigate to a specific question, or propose candidate answers. Responses are immediately synthesized into natural speech via Gnani Timbre TTS and played back in the panel. Crucially, the language dropdown locks both the LLM system prompt and the voice engines to prevent unintended language drift."

---

### Scene 4: Accurate DOM Automation & Safety Invariants (1:40 - 2:20)

- **Duration**: 40 seconds
- **Visual**: Show the assistant proposing a response for a text input. Click "Confirm" or say "Done". Watch the active Google Form tab update automatically: the input receives focus, the value appears, and Google's internal validation state clears without red errors. Show a radio button and checkbox getting selected. Then highlight the "Submit" button on the Google Form to show it remains unclicked.
- **On-Screen Overlay**:
  - Event Sequence: `focus` -> `descriptor.set` -> `keydown` -> `input` -> `change` -> `blur`
  - Invariant: Zero Auto-Submit
  - Invariant: Overwrite Protection

**Narration**:
> "When it comes to populating data, simply setting `input.value` fails silently on Google Forms because Wiz relies on internal event listeners.
> 
> Form Copilot's `filler.ts` dispatches a compliant event cascade: applying the native HTMLInputElement value descriptor, followed by sequential `keydown`, `input`, `change`, and `blur` events. For multiple-choice and checkboxes, it queries `role=radio` and `role=checkbox` aria targets, resolving exact element boundaries while ignoring Google Form header cards.
> 
> Safety is enforced through hard architectural invariants defined in our system spec:
> First, Form Copilot never clicks Submit, Next, or Back in reader mode. Final submission remains entirely under human control.
> Second, it enforces overwrite protection: any field containing pre-existing data is flagged and protected unless the user explicitly commands a replacement."

---

### Scene 5: Security Architecture & Verification (2:20 - 2:50)

- **Duration**: 30 seconds
- **Visual**: Open the Settings modal in the Side Panel. Click "Test Connection" to demonstrate the live backend health check showing green badges for Groq and Gnani. Switch to a terminal and run `npm run test` (Vitest) and `npm run test:e2e` (Playwright), showing all 7 unit tests and 6 browser acceptance tests passing.
- **On-Screen Overlay**:
  - Zero-Trust Extension: No API Keys in Client Bundle
  - Health Probe: `GET /api/health`
  - Acceptance Tests: 100% Pass (Vitest + Playwright)

**Narration**:
> "Security adheres to a zero-trust architecture.
> 
> The Chrome Extension contains zero API credentials. All third-party communication routes through our local Node.js Express daemon, which isolates Groq and Gnani keys in a git-ignored environment file. 
> 
> Users can verify their system status at any time via the Settings panel, which probes our `/api/health` endpoint for live key readiness without exposing raw strings.
> 
> The codebase is fully verified with comprehensive Vitest schema validations and Playwright browser acceptance tests running against isolated multi-page form fixtures."

---

### Scene 6: Outro (2:50 - 3:00)

- **Duration**: 10 seconds
- **Visual**: Full view of the sleek Apple-inspired glassmorphic sidepanel sitting beside a completed Google Form. Fade to GitHub repository link and tech stack badges.
- **On-Screen Overlay**:
  - Form Copilot
  - Open Source | Manifest V3 | React 18 | Node.js | Groq | Gnani

**Narration**:
> "Form Copilot bridges linguistic barriers and turns tedious form filling into an intuitive, accessible voice conversation. 
> 
> Clone the repo, start the backend, and experience form filling built for humans."

---

## Technical Director Notes

### Video Capture Checklist
1. **Screen Resolution**: Record in 1080p (1920x1080) or 4K with 125% browser zoom for crisp font readability.
2. **Browser Setup**: Open Chrome with the Side Panel pinned on the right (approx. 400px width) and the Google Form on the left.
3. **Audio Quality**: Record microphone audio through an external condenser mic with noise suppression enabled.
4. **Terminal Window**: Have VS Code or a modern terminal ready with the backend running in one tab and a second tab ready to execute `npm run test; npm run test:e2e`.
5. **No Emojis**: Confirm all on-screen graphics, overlays, and presentation slides adhere to Rule 7 (plain text, shields badges, and clean typographic iconography only).
