// extension/src/background/index.ts: Manifest V3 service worker managing in-memory snapshot, backend calls, and message routing

import {
  MESSAGE_TYPES,
  FormSnapshot,
  FormSummary,
  FormSnapshotSchema,
  Diagnostics,
} from 'form-copilot-shared';
import { getBackendUrl } from '../settings';

// In-memory state (snapshots and summaries are NEVER persisted to localStorage or chrome.storage)
let currentSnapshot: FormSnapshot | null = null;
let currentSummary: FormSummary | null = null;
let lastError: string | null = null;

async function getActiveFormTab(): Promise<chrome.tabs.Tab> {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  if (!activeTab || !activeTab.id || !activeTab.url) {
    throw new Error('No active browser tab found');
  }

  // Verification that tab is a Google Form
  if (activeTab.url && !activeTab.url.includes('docs.google.com/forms') && !activeTab.url.includes('form-')) {
    throw new Error('Please open an active Google Form (https://docs.google.com/forms/*)');
  }

  return activeTab;
}

// Open side panel automatically when the user clicks the extension icon
if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.warn('SidePanel setPanelBehavior error:', err));
}

if (typeof chrome !== 'undefined' && chrome.action && chrome.action.onClicked) {
  chrome.action.onClicked.addListener(async (tab) => {
    if (chrome.sidePanel && chrome.sidePanel.open && tab.windowId) {
      try {
        await chrome.sidePanel.open({ windowId: tab.windowId });
      } catch (err) {
        console.warn('Failed to open sidePanel:', err);
      }
    }
  });
}

// Listen for messages from side panel or content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message.type !== 'string') return;

  switch (message.type) {
    case MESSAGE_TYPES.GET_SNAPSHOT: {
      sendResponse({
        snapshot: currentSnapshot,
        summary: currentSummary,
      });
      break;
    }

    case MESSAGE_TYPES.GET_DIAGNOSTICS: {
      const totalQuestions = currentSnapshot
        ? currentSnapshot.pages.reduce((acc, p) => acc + p.questions.length, 0)
        : 0;

      const diagnostics: Diagnostics = {
        mode: currentSnapshot?.mode || 'FULL',
        pagesFound: currentSnapshot?.pages.length || 0,
        questionsFound: totalQuestions,
        warnings: currentSnapshot?.warnings || [],
        lastError,
      };

      sendResponse({ diagnostics });
      break;
    }

    case MESSAGE_TYPES.RESET_STATE: {
      currentSnapshot = null;
      currentSummary = null;
      lastError = null;

      getActiveFormTab()
        .then((tab) => {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, { type: MESSAGE_TYPES.RESET_STATE }).catch(() => {});
          }
        })
        .finally(() => {
          sendResponse({ success: true });
        });
      return true;
    }

    case MESSAGE_TYPES.START_SCAN: {
      (async () => {
        try {
          lastError = null;
          const tab = await getActiveFormTab();
          if (!tab.id) throw new Error('Active tab has no ID');

          // Send scan request to content script
          const response = await chrome.tabs.sendMessage(tab.id, {
            type: MESSAGE_TYPES.START_SCAN,
          });

          if (!response || !response.success || !response.snapshot) {
            throw new Error(response?.error || 'Content script failed to scan the form');
          }

          const validatedSnapshot = FormSnapshotSchema.parse(response.snapshot);
          currentSnapshot = validatedSnapshot;

          // Call backend for summary in selected language
          const backendUrl = await getBackendUrl();
          const languageName = message.languageName || 'English';
          const llmRes = await fetch(`${backendUrl}/api/llm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'summary',
              snapshot: validatedSnapshot,
              languageName,
            }),
          });

          if (!llmRes.ok) {
            const errJson = await llmRes.json().catch(() => ({}));
            throw new Error(errJson.error || `Backend summary generation failed (${llmRes.status})`);
          }

          const llmData = await llmRes.json();
          currentSummary = llmData.data;

          sendResponse({
            success: true,
            snapshot: currentSnapshot,
            summary: currentSummary,
          });
        } catch (err: unknown) {
          let errMsg = err instanceof Error ? err.message : String(err);
          if (
            errMsg.includes('Receiving end does not exist') ||
            errMsg.includes('Could not establish connection')
          ) {
            errMsg =
              'कृपया Google Form वाले टैब को रीफ़्रेश (F5 / Reload) करें और फिर "पुनः प्रयास करें" दबाएं। (Please reload the Google Form tab and click Retry).';
          }
          lastError = errMsg;
          sendResponse({ success: false, error: errMsg });
        }
      })();
      return true;
    }

    case MESSAGE_TYPES.FILL_REQUEST: {
      (async () => {
        try {
          const tab = await getActiveFormTab();
          if (!tab.id) throw new Error('Active tab has no ID');

          const response = await chrome.tabs.sendMessage(tab.id, {
            type: MESSAGE_TYPES.FILL_REQUEST,
            questionId: message.questionId,
            entryKey: message.entryKey,
            questionTitle: message.questionTitle,
            answer: message.answer,
          });

          sendResponse(response);
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          sendResponse({
            success: false,
            result: {
              questionId: message.questionId,
              success: false,
              status: 'error',
              message: errMsg,
            },
          });
        }
      })();
      return true;
    }

    default:
      break;
  }
});
