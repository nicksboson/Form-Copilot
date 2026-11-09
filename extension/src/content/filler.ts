// extension/src/content/filler.ts: Safe form filling with value verification and manual fallback

import { FillResult } from 'form-copilot-shared';
import { SELECTORS, isNavigationButton } from './selectors';

function hasInteractiveControl(el: Element): boolean {
  return !!(
    el.querySelector('input:not([type="hidden"]), textarea') ||
    el.querySelector('[role="radio"], [role="radiogroup"]') ||
    el.querySelector('[role="checkbox"], [role="group"]') ||
    el.querySelector('[role="listbox"], [role="combobox"], select')
  );
}

function findQuestionContainer(
  questionId: string,
  entryKey?: string,
  questionTitle?: string
): Element | null {
  const allContainers = Array.from(document.querySelectorAll(SELECTORS.questionContainer));

  // 1. Primary: Match by questionTitle if available (most reliable visual match in Google Forms)
  if (questionTitle) {
    const cleanSearch = questionTitle.replace(/\*/g, '').trim().toLowerCase();
    if (cleanSearch) {
      const headingElements = Array.from(
        document.querySelectorAll(
          `${SELECTORS.questionTitle}, div[role="heading"], span.freebirdFormviewerComponentsQuestionBaseTitle, .M7eMe, .HoXoMd, h1, h2, h3`
        )
      );

      for (const h of headingElements) {
        const text = (h.textContent || '').replace(/\*/g, '').trim().toLowerCase();
        if (text && (text === cleanSearch || text.includes(cleanSearch) || cleanSearch.includes(text))) {
          const card =
            h.closest(SELECTORS.questionContainer) ||
            h.closest('.Qr7Oae') ||
            h.parentElement?.closest('.Qr7Oae, div[role="listitem"]') ||
            h.parentElement;
          if (card && hasInteractiveControl(card)) {
            return card;
          }
        }
      }
    }
  }

  // 2. Candidate entry keys (e.g. entry.123456)
  const candidateKeys = [
    entryKey,
    questionId.startsWith('entry.') ? questionId : `entry.${questionId}`,
  ].filter(Boolean) as string[];

  for (const k of candidateKeys) {
    const input = document.querySelector(`[name="${k}"]`);
    if (input) {
      const parentCard = input.closest(SELECTORS.questionContainer) || input.parentElement;
      if (parentCard && hasInteractiveControl(parentCard)) return parentCard;
    }
    for (const c of allContainers) {
      if (c.querySelector(`[name="${k}"]`) && hasInteractiveControl(c)) return c;
    }
  }

  // 3. Numeric ID matching in data-params
  if (/^\d+$/.test(questionId)) {
    const paramsElements = Array.from(document.querySelectorAll(`[data-params*="${questionId}"]`));
    for (const p of paramsElements) {
      const card = p.closest(SELECTORS.questionContainer) || p.closest('.Qr7Oae') || p;
      if (card && hasInteractiveControl(card)) return card;
    }

    for (const c of allContainers) {
      const paramsEl = c.hasAttribute('data-params') ? c : c.querySelector('[data-params]');
      if (paramsEl) {
        const params = paramsEl.getAttribute('data-params');
        if (params && params.includes(questionId) && hasInteractiveControl(c)) return c;
      }
    }
  }

  // 4. Match by data-item-id
  let container = document.querySelector(`[data-item-id="${questionId}"]`);
  if (container) {
    const card = container.closest(SELECTORS.questionContainer) || container;
    if (hasInteractiveControl(card)) return card;
  }

  for (const c of allContainers) {
    if (c.getAttribute('data-item-id') === questionId && hasInteractiveControl(c)) return c;
  }

  // 5. Fallback: match by title against allContainers even without interactive check
  if (questionTitle) {
    const cleanSearch = questionTitle.replace(/\*/g, '').trim().toLowerCase();
    for (const c of allContainers) {
      const headingEl = c.querySelector(SELECTORS.questionTitle);
      if (headingEl && headingEl.textContent) {
        const cleanHeading = headingEl.textContent.replace(/\*/g, '').trim().toLowerCase();
        if (cleanHeading === cleanSearch || cleanHeading.includes(cleanSearch) || cleanSearch.includes(cleanHeading)) {
          return c;
        }
      }
    }
  }

  return null;
}

function setNativeInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  try {
    element.focus();
  } catch {}

  const prototype =
    element instanceof HTMLTextAreaElement
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;

  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  if (descriptor && descriptor.set) {
    descriptor.set.call(element, value);
  } else {
    element.value = value;
  }

  element.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  try {
    element.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true, data: value }));
  } catch {}
  element.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  try {
    element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, composed: true }));
    element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, composed: true }));
  } catch {}

  try {
    element.blur();
  } catch {}
}

export async function fillFormField(
  questionId: string,
  answer: string | string[],
  entryKey?: string,
  questionTitle?: string
): Promise<FillResult> {
  let container = findQuestionContainer(questionId, entryKey, questionTitle);
  if (!container) {
    return {
      questionId,
      success: false,
      status: 'not_found',
      message: 'Question container not found on the page',
    };
  }

  // Ensure container is the question card element
  const card = container.closest(SELECTORS.questionContainer);
  if (card) {
    container = card;
  }

  // Smoothly scroll to the question so the user sees it in realtime
  try {
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const targetEl = container as HTMLElement;
    const prevTransition = targetEl.style.transition;
    const prevOutline = targetEl.style.outline;
    targetEl.style.transition = 'outline 0.3s ease';
    targetEl.style.outline = '2px solid rgba(99, 102, 241, 0.8)';
    setTimeout(() => {
      targetEl.style.outline = prevOutline;
      targetEl.style.transition = prevTransition;
    }, 1500);
  } catch {}

  // Check for Date, Time, File Upload fields -> do not fill automatically
  if (container.querySelector(SELECTORS.dateInput)) {
    return {
      questionId,
      success: false,
      status: 'manual_required',
      message: 'यह फ़ील्ड आपको खुद भरना होगा',
    };
  }
  if (container.querySelector(SELECTORS.timeInput)) {
    return {
      questionId,
      success: false,
      status: 'manual_required',
      message: 'यह फ़ील्ड आपको खुद भरना होगा',
    };
  }
  if (container.querySelector(SELECTORS.fileUpload)) {
    return {
      questionId,
      success: false,
      status: 'manual_required',
      message: 'यह फ़ील्ड आपको खुद भरना होगा',
    };
  }

  // 1. Text input or textarea
  let textInput = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    `${SELECTORS.shortText}, ${SELECTORS.paragraph}`
  );
  if (!textInput) {
    // Robust fallback: inspect all input elements in the container
    const allInputs = Array.from(container.querySelectorAll<HTMLInputElement>('input'));
    textInput =
      allInputs.find(
        (i) =>
          i.type !== 'hidden' &&
          i.type !== 'checkbox' &&
          i.type !== 'radio' &&
          i.type !== 'button' &&
          i.type !== 'submit'
      ) || null;
    if (!textInput) {
      textInput = container.querySelector<HTMLTextAreaElement>('textarea');
    }
    if (!textInput) {
      const outer = container.closest(SELECTORS.questionContainer) || container.parentElement;
      if (outer) {
        textInput = outer.querySelector<HTMLInputElement | HTMLTextAreaElement>(
          'input.whsOnd, input[jsname="YPqjbf"], textarea.KHxj8b, textarea[jsname="YPqjbf"], input[type="text"], textarea'
        );
      }
    }
  }

  if (textInput) {
    if (textInput.value && textInput.value.trim().length > 0) {
      return {
        questionId,
        success: false,
        status: 'already_filled',
        message: 'already filled',
        readValue: textInput.value,
      };
    }

    const valueToFill = Array.isArray(answer) ? answer.join(', ') : String(answer);
    setNativeInputValue(textInput, valueToFill);

    // Also update any hidden input for form submission
    const hiddenInputs = container.querySelectorAll<HTMLInputElement>('input[type="hidden"]');
    for (const h of Array.from(hiddenInputs)) {
      if (h.name && h.name.startsWith('entry.')) {
        h.value = valueToFill;
      }
    }

    // Also check document root for hidden input matching entryKey
    const targetKey =
      entryKey || (questionId.startsWith('entry.') ? questionId : `entry.${questionId}`);
    if (targetKey) {
      const globalHidden = document.querySelector<HTMLInputElement>(
        `input[type="hidden"][name="${targetKey}"]`
      );
      if (globalHidden) {
        globalHidden.value = valueToFill;
      }
    }

    return {
      questionId,
      success: true,
      status: 'filled',
      message: 'Field successfully filled',
      readValue: textInput.value,
    };
  }

  // 2. Multiple choice / Linear scale (Radio group)
  const radioGroup = container.querySelector(SELECTORS.radioGroup);
  if (radioGroup) {
    const targetValue = (Array.isArray(answer) ? answer[0] : String(answer)).trim().toLowerCase();
    const radios = Array.from(radioGroup.querySelectorAll(SELECTORS.radioOption));

    // Check if already filled
    const alreadyChecked = radios.find((r) => r.getAttribute('aria-checked') === 'true');
    if (alreadyChecked) {
      const readVal = (alreadyChecked.getAttribute('data-value') || alreadyChecked.textContent || '').trim();
      return {
        questionId,
        success: false,
        status: 'already_filled',
        message: 'already filled',
        readValue: readVal,
      };
    }

    const match = radios.find((r) => {
      const val = (r.getAttribute('data-value') || r.textContent || '').trim().toLowerCase();
      return val === targetValue || val.includes(targetValue);
    });

    if (!match) {
      return {
        questionId,
        success: false,
        status: 'error',
        message: `Option "${answer}" not found in radio choices`,
      };
    }

    if (!isNavigationButton(match)) {
      (match as HTMLElement).click();
    }

    const readVal = (match.getAttribute('data-value') || match.textContent || '').trim();
    return {
      questionId,
      success: true,
      status: 'filled',
      message: 'Option selected',
      readValue: readVal,
    };
  }

  // 3. Checkboxes
  const checkboxGroup = container.querySelector(SELECTORS.checkboxGroup) || container;
  const checkboxes = Array.from(checkboxGroup.querySelectorAll(SELECTORS.checkboxOption));
  if (checkboxes.length > 0) {
    const targets = (Array.isArray(answer) ? answer : [String(answer)]).map((s) => s.trim().toLowerCase());
    const readValues: string[] = [];
    let filledAny = false;

    for (const cb of checkboxes) {
      const val = (cb.getAttribute('data-value') || cb.textContent || '').trim();
      const valLower = val.toLowerCase();
      const isChecked = cb.getAttribute('aria-checked') === 'true';

      if (targets.some((t) => t === valLower || valLower.includes(t))) {
        if (!isChecked) {
          if (!isNavigationButton(cb)) {
            (cb as HTMLElement).click();
            filledAny = true;
          }
        }
        readValues.push(val);
      } else if (isChecked) {
        readValues.push(val);
      }
    }

    if (!filledAny && readValues.length > 0) {
      return {
        questionId,
        success: false,
        status: 'already_filled',
        message: 'already filled',
        readValue: readValues,
      };
    }

    return {
      questionId,
      success: true,
      status: 'filled',
      message: 'Checkboxes updated',
      readValue: readValues,
    };
  }

  // 4. Dropdown listbox
  const listBox = container.querySelector(SELECTORS.dropdownListBox);
  if (listBox) {
    const selectedEl = listBox.querySelector('.dropdown-selected');
    const currentVal = selectedEl ? (selectedEl.textContent || '').trim() : '';
    if (currentVal && currentVal !== 'Choose' && currentVal !== 'चुनें') {
      return {
        questionId,
        success: false,
        status: 'already_filled',
        message: 'already filled',
        readValue: currentVal,
      };
    }

    // Open dropdown
    if (!isNavigationButton(listBox)) {
      (listBox as HTMLElement).click();
    }

    await new Promise((resolve) => setTimeout(resolve, 150));

    const options = Array.from(listBox.querySelectorAll(SELECTORS.dropdownOption));
    const targetValue = (Array.isArray(answer) ? answer[0] : String(answer)).trim().toLowerCase();

    const match = options.find((opt) => {
      const val = (opt.getAttribute('data-value') || opt.textContent || '').trim().toLowerCase();
      return val === targetValue || val.includes(targetValue);
    });

    if (!match) {
      return {
        questionId,
        success: false,
        status: 'error',
        message: `Dropdown option "${answer}" not found`,
      };
    }

    if (!isNavigationButton(match)) {
      (match as HTMLElement).click();
    }

    const readVal = (match.getAttribute('data-value') || match.textContent || '').trim();
    return {
      questionId,
      success: true,
      status: 'filled',
      message: 'Dropdown option selected',
      readValue: readVal,
    };
  }

  return {
    questionId,
    success: false,
    status: 'error',
    message: 'Unsupported field element type',
  };
}
