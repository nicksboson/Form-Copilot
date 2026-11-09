// extension/src/content/selectors.ts: Centralized Google Forms DOM selectors and internal keys

export const SELECTORS = {
  // Form container and headers
  formContainer: 'form, div[role="list"]',
  formTitle: 'h1[role="heading"], div[role="heading"][aria-level="1"], .freebirdFormviewerViewHeaderTitle',
  formDescription: 'div[role="heading"][aria-level="1"] + div, .freebirdFormviewerViewHeaderDescription',
  pageIndicator: '#pageIndicator, .freebirdFormviewerViewNavigationPercentComplete',

  // Question container
  questionContainer: 'div[role="listitem"], .freebirdFormviewerViewNumberedItemContainer, .Qr7Oae',
  questionTitle: 'div[role="heading"][aria-level="2"], div[role="heading"], span.freebirdFormviewerComponentsQuestionBaseTitle',
  questionDescription: '.freebirdFormviewerComponentsQuestionBaseHelpText, .M7eMe',
  requiredAsterisk: 'span[aria-label*="Required"], span[aria-label*="ज़रूरी"], span.required-asterisk, span[aria-hidden="true"]',

  // Input elements
  shortText: 'input.whsOnd, input[jsname="YPqjbf"], input[type="text"], input[type="email"], input[type="url"], input[type="tel"], input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"])',
  paragraph: 'textarea.KHxj8b, textarea[jsname="YPqjbf"], textarea',
  radioGroup: 'div[role="radiogroup"]',
  radioOption: 'div[role="radio"]',
  checkboxGroup: 'div[role="group"]',
  checkboxOption: 'div[role="checkbox"]',
  dropdownListBox: 'div[role="listbox"]',
  dropdownOption: 'div[role="option"]',
  dateInput: 'input[type="date"]',
  timeInput: 'input[type="time"]',
  fileUpload: 'input[type="file"], div[role="button"][aria-label*="file"], div[role="button"][aria-label*="फ़ाइल"]',

  // Navigation buttons to detect and NEVER click in reader mode
  navigationButtons: 'div[role="button"], button',
  submitButtonText: ['submit', 'send', 'जमा करें', 'सबमिट'],
  nextButtonText: ['next', 'आगे', 'अगला'],
  backButtonText: ['back', 'वापस', 'पीछे'],
} as const;

export const EMBEDDED_KEYS = {
  scriptVariable: 'FB_PUBLIC_LOAD_DATA_',
} as const;

// Helper to check if an element is a navigation button (Submit, Next, Back)
export function isNavigationButton(element: Element): boolean {
  const text = (element.textContent || '').trim().toLowerCase();
  const ariaLabel = (element.getAttribute('aria-label') || '').trim().toLowerCase();

  const isSubmit = SELECTORS.submitButtonText.some(
    (kw) => text.includes(kw) || ariaLabel.includes(kw)
  );
  const isNext = SELECTORS.nextButtonText.some(
    (kw) => text.includes(kw) || ariaLabel.includes(kw)
  );
  const isBack = SELECTORS.backButtonText.some(
    (kw) => text.includes(kw) || ariaLabel.includes(kw)
  );

  return isSubmit || isNext || isBack;
}
