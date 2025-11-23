// Content script - Runs in web pages

import { Logger } from '@/utils/logger';

const logger = new Logger('Content');

// Initialize content script
logger.log('Content script loaded on:', window.location.href);

// Listen for messages from background or popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  logger.log('Content script received message:', message);

  if (message.type === 'PING') {
    sendResponse({ status: 'OK', url: window.location.href });
  }

  return false;
});

// Notify background that content script is ready
chrome.runtime
  .sendMessage({
    type: 'CONTENT_SCRIPT_READY',
    url: window.location.href,
  })
  .catch((error) => {
    logger.error('Error sending ready message:', error);
  });

export {};
