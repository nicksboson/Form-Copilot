// extension/src/content/index.ts: Content script message listener and dispatcher

import { MESSAGE_TYPES } from 'form-copilot-shared';
import { readGoogleForm, cleanupReader } from './reader';
import { fillFormField } from './filler';

// Listen for messages from background service worker
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return;

  switch (message.type) {
    case MESSAGE_TYPES.START_SCAN: {
      readGoogleForm((updatedSnapshot) => {
        // Send page update when user navigates pages in PARTIAL mode
        chrome.runtime.sendMessage({
          type: MESSAGE_TYPES.SCAN_COMPLETE,
          snapshot: updatedSnapshot,
        });
      })
        .then((snapshot) => {
          sendResponse({ success: true, snapshot });
        })
        .catch((err: unknown) => {
          const errMsg = err instanceof Error ? err.message : String(err);
          sendResponse({ success: false, error: errMsg });
        });
      return true; // Keep message channel open for async response
    }

    case MESSAGE_TYPES.FILL_REQUEST: {
      const { questionId, answer, entryKey, questionTitle } = message;
      fillFormField(questionId, answer, entryKey, questionTitle)
        .then((result) => {
          sendResponse({ success: true, result });
        })
        .catch((err: unknown) => {
          const errMsg = err instanceof Error ? err.message : String(err);
          sendResponse({
            success: false,
            result: {
              questionId,
              success: false,
              status: 'error',
              message: errMsg,
            },
          });
        });
      return true;
    }

    case MESSAGE_TYPES.RESET_STATE: {
      cleanupReader();
      sendResponse({ success: true });
      break;
    }

    default:
      break;
  }
});
