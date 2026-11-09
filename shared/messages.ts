// shared/messages.ts: Message type constants and payload contracts between extension contexts

export const MESSAGE_TYPES = {
  START_SCAN: 'START_SCAN',
  SCAN_PROGRESS: 'SCAN_PROGRESS',
  SCAN_COMPLETE: 'SCAN_COMPLETE',
  SCAN_ERROR: 'SCAN_ERROR',
  GET_SNAPSHOT: 'GET_SNAPSHOT',
  SNAPSHOT_RESPONSE: 'SNAPSHOT_RESPONSE',
  FILL_REQUEST: 'FILL_REQUEST',
  FILL_RESULT: 'FILL_RESULT',
  PAGE_CHANGED: 'PAGE_CHANGED',
  RESET_STATE: 'RESET_STATE',
  GET_DIAGNOSTICS: 'GET_DIAGNOSTICS',
  DIAGNOSTICS_RESPONSE: 'DIAGNOSTICS_RESPONSE',
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export interface BaseMessage {
  type: MessageType;
}

export interface StartScanMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.START_SCAN;
}

export interface ScanProgressMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.SCAN_PROGRESS;
  progressPercent: number;
  message: string;
}

export interface ScanCompleteMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.SCAN_COMPLETE;
  snapshot: unknown;
}

export interface ScanErrorMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.SCAN_ERROR;
  error: string;
}

export interface FillRequestMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.FILL_REQUEST;
  questionId: string;
  entryKey?: string;
  questionTitle?: string;
  answer: string | string[];
}

export interface FillResultMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.FILL_RESULT;
  result: unknown;
}

export interface PageChangedMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.PAGE_CHANGED;
  pageIndex: number;
}

export interface ResetStateMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.RESET_STATE;
}

export interface GetDiagnosticsMessage extends BaseMessage {
  type: typeof MESSAGE_TYPES.GET_DIAGNOSTICS;
}
