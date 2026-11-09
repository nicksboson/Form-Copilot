// extension/src/content/embedded.ts: Extracts and parses FB_PUBLIC_LOAD_DATA_ from Google Form HTML

import { FormSnapshot, FormPage, Question, QuestionType } from 'form-copilot-shared';

function mapItemTypeCode(code: number): QuestionType {
  switch (code) {
    case 0:
      return 'text';
    case 1:
      return 'paragraph';
    case 2:
      return 'radio';
    case 3:
      return 'dropdown';
    case 4:
      return 'checkboxes';
    case 5:
      return 'linear_scale';
    case 9:
      return 'date';
    case 10:
      return 'time';
    case 13:
      return 'file_upload';
    default:
      return 'unknown';
  }
}

// Extract raw FB_PUBLIC_LOAD_DATA_ array using balanced bracket parser
export function extractEmbeddedScriptData(source: Document | string = document): unknown[] | null {
  const htmlText =
    typeof source === 'string'
      ? source
      : source.documentElement?.innerHTML ||
        Array.from(source.querySelectorAll('script'))
          .map((s) => s.textContent || '')
          .join('\n');

  const marker = 'FB_PUBLIC_LOAD_DATA_';
  const markerIdx = htmlText.indexOf(marker);
  if (markerIdx === -1) return null;

  const startBracket = htmlText.indexOf('[', markerIdx);
  if (startBracket === -1) return null;

  let depth = 0;
  let endBracket = -1;
  let inString: string | null = null;
  let isEscaped = false;

  for (let i = startBracket; i < htmlText.length; i++) {
    const char = htmlText[i];

    if (inString) {
      if (isEscaped) {
        isEscaped = false;
      } else if (char === '\\') {
        isEscaped = true;
      } else if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      inString = char;
      continue;
    }

    if (char === '[') {
      depth++;
    } else if (char === ']') {
      depth--;
      if (depth === 0) {
        endBracket = i;
        break;
      }
    }
  }

  if (endBracket !== -1) {
    const jsonStr = htmlText.substring(startBracket, endBracket + 1);
    const cleanJson = jsonStr
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n\r]*/g, '');
    try {
      return JSON.parse(cleanJson);
    } catch {
      try {
        const sanitized = cleanJson.replace(/,\s*([\]}])/g, '$1');
        return JSON.parse(sanitized);
      } catch {
        return null;
      }
    }
  }

  return null;
}

// Parses raw FB_PUBLIC_LOAD_DATA_ array into a typed FormSnapshot
export function parseEmbeddedFormSnapshot(rawData: unknown[]): FormSnapshot {
  if (!Array.isArray(rawData) || !Array.isArray(rawData[1])) {
    throw new Error('Invalid FB_PUBLIC_LOAD_DATA_ structure');
  }

  const formData = rawData[1] as unknown[];
  const rawItems = (formData[1] || []) as unknown[][];
  const formTitle = typeof formData[8] === 'string' && formData[8] ? formData[8] : 'Google Form';
  const formDescription = typeof formData[0] === 'string' ? formData[0] : undefined;

  const pages: FormPage[] = [];
  let currentPageIndex = 0;
  let currentQuestions: Question[] = [];
  let currentPageTitle: string | undefined = undefined;
  let currentPageDesc: string | undefined = undefined;

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    if (!Array.isArray(item)) continue;

    const itemId = String(item[0] || `item_${i}`);
    const itemTitle = typeof item[1] === 'string' ? item[1] : '';
    const itemDesc = typeof item[2] === 'string' ? item[2] : undefined;
    const typeCode = typeof item[3] === 'number' ? item[3] : -1;

    // Type 8 is a PageBreakItem (Section Header) in Google Forms
    if (typeCode === 8) {
      pages.push({
        index: currentPageIndex,
        title: currentPageTitle,
        description: currentPageDesc,
        questions: currentQuestions,
      });
      currentPageIndex++;
      currentQuestions = [];
      currentPageTitle = itemTitle;
      currentPageDesc = itemDesc;
      continue;
    }

    const questionType = mapItemTypeCode(typeCode);
    if (questionType === 'unknown' && !itemTitle) {
      continue; // Skip decorative non-question elements
    }

    const fieldConfig = Array.isArray(item[4]) && Array.isArray(item[4][0]) ? item[4][0] : [];
    const entryId = fieldConfig[0] ? `entry.${fieldConfig[0]}` : undefined;
    const rawOptions = Array.isArray(fieldConfig[1]) ? fieldConfig[1] : [];
    const isRequired = fieldConfig[2] === 1;

    // Extract options and check for branching targets
    let isBranching = false;
    const options: string[] = [];
    for (const opt of rawOptions) {
      if (Array.isArray(opt) && typeof opt[0] === 'string') {
        options.push(opt[0]);
        // If option array has a non-null routing code / destination section
        if (opt[4] !== undefined && opt[4] !== null) {
          isBranching = true;
        }
      } else if (typeof opt === 'string') {
        options.push(opt);
      }
    }

    currentQuestions.push({
      id: itemId,
      entryKey: entryId,
      title: itemTitle || `Question ${currentQuestions.length + 1}`,
      description: itemDesc,
      type: questionType,
      required: isRequired,
      options: options.length > 0 ? options : undefined,
      pageIndex: currentPageIndex,
      isBranching: isBranching ? true : undefined,
    });
  }

  // Push final page
  pages.push({
    index: currentPageIndex,
    title: currentPageTitle,
    description: currentPageDesc,
    questions: currentQuestions,
  });

  return {
    formTitle,
    formDescription,
    mode: 'FULL',
    pages,
    warnings: [],
    scannedAt: new Date().toISOString(),
  };
}
