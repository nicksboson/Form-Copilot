// extension/manifest.config.ts: Chrome Extension Manifest V3 configuration

import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'Form Copilot',
  version: '1.0.0',
  description: 'AI assistant for Hindi-speaking users to understand and fill Google Forms safely.',
  permissions: ['storage', 'sidePanel'],
  host_permissions: [
    'https://docs.google.com/forms/*',
    'https://form-copilot.onrender.com/*',
    'http://localhost:3001/*',
    'http://127.0.0.1:3001/*',
  ],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  content_scripts: [
    {
      matches: ['https://docs.google.com/forms/*'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle',
    },
  ],
  side_panel: {
    default_path: 'src/sidepanel/index.html',
  },
  action: {
    default_title: 'Open Form Copilot',
  },
});
