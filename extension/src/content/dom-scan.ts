// extension/src/content/dom-scan.ts: Visible page DOM scanner for PARTIAL mode and page mutation monitoring

import { FormSnapshot, FormPage, Question, QuestionType } from 'form-copilot-shared';
import { SELECTORS, isNavigationButton } from './selectors';

function determineQuestionType(container: Element): QuestionType {
  if (container.querySelector(SELECTORS.fileUpload)) return 'file_upload';
  if (container.querySelector(SELECTORS.dateInput)) return 'date';
  if (container.querySelector(SELECTORS.timeInput)) return 'time';
  if (container.querySelector(SELECTORS.dropdownListBox)) return 'dropdown';
  if (container.querySelector(SELECTORS.checkboxOption)) return 'checkboxes';

  const radioGroup = container.querySelector(SELECTORS.radioGroup);
  if (radioGroup) {
    const radioOpts = Array.from(radioGroup.querySelectorAll(SELECTORS.radioOption));
    const isLinearScale =
      radioOpts.length >= 3 &&
      radioOpts.every((opt) => /^[0-9]+$/.test((opt.textContent || '').trim()));
    return isLinearScale ? 'linear_scale' : 'radio';
  }

  if (container.querySelector(SELECTORS.paragraph)) return 'paragraph';
  if (container.querySelector(SELECTORS.shortText)) return 'text';

  return 'unknown';
}

function extractOptions(container: Element, type: QuestionType): string[] | undefined {
  if (type === 'radio' || type === 'linear_scale') {
    const radios = Array.from(container.querySelectorAll(SELECTORS.radioOption));
    const labels = radios
      .map((r) => (r.getAttribute('data-value') || r.textContent || '').trim())
      .filter(Boolean);
    return labels.length > 0 ? labels : undefined;
  }

  if (type === 'checkboxes') {
    const checkboxes = Array.from(container.querySelectorAll(SELECTORS.checkboxOption));
    const labels = checkboxes
      .map((c) => (c.getAttribute('data-value') || c.textContent || '').trim())
      .filter(Boolean);
    return labels.length > 0 ? labels : undefined;
  }

  if (type === 'dropdown') {
    const options = Array.from(container.querySelectorAll(SELECTORS.dropdownOption));
    const labels = options
      .map((o) => (o.getAttribute('data-value') || o.textContent || '').trim())
      .filter(Boolean);
    return labels.length > 0 ? labels : undefined;
  }

  return undefined;
}

export function getCurrentPageIndex(): number {
  const indicator = document.querySelector(SELECTORS.pageIndicator);
  if (indicator && indicator.textContent) {
    const match = indicator.textContent.match(/Page\s+(\d+)\s+of/i);
    if (match && match[1]) {
      return Math.max(0, parseInt(match[1], 10) - 1);
    }
  }
  // Check active page element
  const activePage = document.querySelector('.form-page.active');
  if (activePage) {
    const pageAttr = activePage.getAttribute('data-page-index');
    if (pageAttr !== null) return parseInt(pageAttr, 10);
  }
  return 0;
}

export function scanVisiblePage(pageIndex = getCurrentPageIndex()): FormPage {
  const formElement = document.querySelector(SELECTORS.formContainer) || document.body;
  const rawCards = Array.from(formElement.querySelectorAll(SELECTORS.questionContainer));

  // Filter out any element that is actually a navigation button or header
  const questionCards = rawCards.filter((card) => {
    return !isNavigationButton(card) && card.querySelector(SELECTORS.questionTitle);
  });

  const questions: Question[] = [];

  for (let i = 0; i < questionCards.length; i++) {
    const card = questionCards[i];
    // Check if question belongs to active page if multi-page structure is present
    const parentPage = card.closest('.form-page');
    if (parentPage && !parentPage.classList.contains('active')) {
      continue;
    }

    const titleEl = card.querySelector(SELECTORS.questionTitle);
    const title = titleEl ? (titleEl.textContent || '').replace(/\s*\*\s*$/, '').trim() : `Question ${i + 1}`;

    const descEl = card.querySelector(SELECTORS.questionDescription);
    const description = descEl ? (descEl.textContent || '').trim() : undefined;

    const hasAsterisk = !!card.querySelector(SELECTORS.requiredAsterisk);
    const hasRequiredAttr = !!card.querySelector('[required], [aria-required="true"]');
    const isRequired = hasAsterisk || hasRequiredAttr;

    const qType = determineQuestionType(card);
    const options = extractOptions(card, qType);

    const inputEl = card.querySelector('input[name^="entry."], textarea[name^="entry."]');
    const entryKey = inputEl ? inputEl.getAttribute('name') || undefined : undefined;
    const itemId = card.getAttribute('data-item-id') || entryKey || `dom_q_${pageIndex}_${i}`;

    questions.push({
      id: itemId,
      entryKey,
      title,
      description,
      type: qType,
      required: isRequired,
      options,
      pageIndex,
      isBranching: card.getAttribute('data-branch') === 'true' ? true : undefined,
    });
  }

  return {
    index: pageIndex,
    questions,
  };
}

export function scanDomPartialSnapshot(): FormSnapshot {
  const titleEl = document.querySelector(SELECTORS.formTitle);
  const formTitle = titleEl ? (titleEl.textContent || '').trim() : 'Google Form';

  const descEl = document.querySelector(SELECTORS.formDescription);
  const formDescription = descEl ? (descEl.textContent || '').trim() : undefined;

  const page = scanVisiblePage();
  const warnings: string[] = [];

  const indicator = document.querySelector(SELECTORS.pageIndicator);
  if (indicator && indicator.textContent && indicator.textContent.includes('of')) {
    warnings.push(`PARTIAL mode: Only page ${page.index + 1} is currently scanned. Moving to other pages will add them.`);
  }

  return {
    formTitle,
    formDescription,
    mode: 'PARTIAL',
    pages: [page],
    warnings,
    scannedAt: new Date().toISOString(),
  };
}

// Watch for DOM page changes without clicking anything
export function observePageChanges(onPageChange: (newPage: FormPage) => void): () => void {
  let lastPageIndex = getCurrentPageIndex();

  const observer = new MutationObserver(() => {
    const currentIdx = getCurrentPageIndex();
    if (currentIdx !== lastPageIndex) {
      lastPageIndex = currentIdx;
      const newPage = scanVisiblePage(currentIdx);
      onPageChange(newPage);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true, attributes: true });

  return () => observer.disconnect();
}
