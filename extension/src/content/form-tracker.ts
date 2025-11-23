// Form tracking content script

import { Logger } from '@/utils/logger';
import type { FormData } from '@/types';

const logger = new Logger('FormTracking');

// PII patterns to filter out
const PII_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-+()]+$/,
  ssn: /^\d{3}-?\d{2}-?\d{4}$/,
  creditCard: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/,
  password: true, // Always filter password fields
};

// Sensitive field names/types to filter
const SENSITIVE_FIELDS = [
  'password',
  'pwd',
  'pass',
  'passwd',
  'credit',
  'card',
  'cvv',
  'ssn',
  'tax',
  'account',
  'routing',
  'pin',
];

class FormTracker {
  private trackedForms: Set<HTMLFormElement> = new Set();
  private observing = false;

  /**
   * Initialize form tracking
   */
  init(): void {
    if (this.observing) return;

    logger.log('Initializing form tracking');

    // Track existing forms
    this.trackForms();

    // Watch for dynamically added forms
    this.observeDOM();

    // Listen for messages from background
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'GET_FORM_DATA') {
        const formData = this.getAllFormData();
        sendResponse({ formData });
      }
      return true;
    });

    this.observing = true;
  }

  /**
   * Track all forms on the page
   */
  private trackForms(): void {
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => this.trackForm(form));
  }

  /**
   * Track a specific form
   */
  private trackForm(form: HTMLFormElement): void {
    if (this.trackedForms.has(form)) return;

    this.trackedForms.add(form);

    // Track form submission
    form.addEventListener('submit', (e) => this.handleFormSubmit(e, form), {
      capture: true,
    });

    logger.log('Tracking form:', form.id || form.name || 'unnamed');
  }

  /**
   * Handle form submission
   */
  private async handleFormSubmit(_event: Event, form: HTMLFormElement): Promise<void> {
    try {
      logger.log('Form submitted:', form.id || form.name);

      const formData = this.extractFormData(form);

      // Send to background for storage
      chrome.runtime.sendMessage({
        type: 'FORM_SUBMITTED',
        formData,
      });

      // Capture screenshot of form submission
      chrome.runtime.sendMessage({
        type: 'CAPTURE_SCREENSHOT',
        trigger: 'form_submit',
      });
    } catch (error) {
      logger.error('Error handling form submit:', error);
    }
  }

  /**
   * Extract data from form
   */
  private extractFormData(form: HTMLFormElement): FormData {
    const fields: FormData['fields'] = [];
    const formElements = form.elements;

    for (let i = 0; i < formElements.length; i++) {
      const element = formElements[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

      if (!element.name) continue;

      // Skip sensitive fields
      if (this.isSensitiveField(element)) {
        fields.push({
          name: element.name,
          type: element.type || element.tagName.toLowerCase(),
          value: '[FILTERED]',
        });
        continue;
      }

      // Get field value
      let value = '';
      if ('value' in element) {
        value = element.value;
      }

      // Apply PII filtering
      if (this.containsPII(value)) {
        value = '[PII_FILTERED]';
      }

      // Truncate long values
      if (value.length > 500) {
        value = value.substring(0, 500) + '...';
      }

      fields.push({
        name: element.name,
        type: element.type || element.tagName.toLowerCase(),
        value,
      });
    }

    return {
      id: `form_${Date.now()}`,
      timestamp: Date.now(),
      url: window.location.href,
      formId: form.id,
      fields,
    };
  }

  /**
   * Check if field is sensitive
   */
  private isSensitiveField(element: HTMLElement): boolean {
    const name = element.getAttribute('name')?.toLowerCase() || '';
    const id = element.getAttribute('id')?.toLowerCase() || '';
    const type = element.getAttribute('type')?.toLowerCase() || '';
    const autocomplete = element.getAttribute('autocomplete')?.toLowerCase() || '';

    // Check type
    if (type === 'password') return true;

    // Check name, id, and autocomplete
    return SENSITIVE_FIELDS.some(
      (sensitive) =>
        name.includes(sensitive) || id.includes(sensitive) || autocomplete.includes(sensitive)
    );
  }

  /**
   * Check if value contains PII
   */
  private containsPII(value: string): boolean {
    if (!value || value.length === 0) return false;

    // Check email pattern
    if (PII_PATTERNS.email.test(value)) return true;

    // Check phone pattern
    if (value.replace(/\D/g, '').length >= 10 && PII_PATTERNS.phone.test(value)) {
      return true;
    }

    // Check SSN pattern
    if (PII_PATTERNS.ssn.test(value)) return true;

    // Check credit card pattern
    if (PII_PATTERNS.creditCard.test(value.replace(/\s/g, ''))) return true;

    return false;
  }

  /**
   * Get all form data from page
   */
  private getAllFormData(): FormData[] {
    const allFormData: FormData[] = [];

    this.trackedForms.forEach((form) => {
      allFormData.push(this.extractFormData(form));
    });

    return allFormData;
  }

  /**
   * Observe DOM for dynamically added forms
   */
  private observeDOM(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;

            // Check if added node is a form
            if (element.tagName === 'FORM') {
              this.trackForm(element as HTMLFormElement);
            }

            // Check for forms within added node
            const forms = element.querySelectorAll('form');
            forms.forEach((form) => this.trackForm(form));
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}

// Initialize form tracker
const formTracker = new FormTracker();

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => formTracker.init());
} else {
  formTracker.init();
}

export { formTracker };
