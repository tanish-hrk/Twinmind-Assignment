// Background service worker - Core extension logic

import { Logger } from '@/utils/logger';
import { Storage } from '@/utils/storage';
import type { TabEvent, BrowsingSession, UserSettings } from '@/types';

const logger = new Logger('Background');

// Initialize extension on install
chrome.runtime.onInstalled.addListener(async (details) => {
  logger.log('Extension installed:', details.reason);

  if (details.reason === 'install') {
    // Set default settings
    const defaultSettings: UserSettings = {
      captureEnabled: true,
      audioEnabled: false,
      screenshotEnabled: false,
      formTrackingEnabled: false,
      excludedDomains: ['chrome://', 'chrome-extension://'],
      theme: 'auto',
      notificationsEnabled: true,
      dataRetentionDays: 30,
    };

    await Storage.set('settings', defaultSettings);
    await Storage.set('sessions', []);
    await Storage.set('capturedContexts', []);

    // Open welcome page
    chrome.tabs.create({ url: chrome.runtime.getURL('src/options/index.html') });
  }
});

// Track tab events
let currentSession: BrowsingSession | null = null;
let activeTabId: number | null = null;
let activeTabStartTime: number = Date.now();

// Start new session
async function startNewSession(): Promise<void> {
  currentSession = {
    id: `session_${Date.now()}`,
    startTime: Date.now(),
    tabs: [],
    totalActiveTime: 0,
  };
  logger.log('New session started:', currentSession.id);
}

// Save current session
async function saveCurrentSession(): Promise<void> {
  if (!currentSession) return;

  currentSession.endTime = Date.now();
  currentSession.totalActiveTime = currentSession.endTime - currentSession.startTime;

  const sessions = (await Storage.get<BrowsingSession[]>('sessions')) || [];
  sessions.push(currentSession);

  // Keep only last 100 sessions
  if (sessions.length > 100) {
    sessions.splice(0, sessions.length - 100);
  }

  await Storage.set('sessions', sessions);
  logger.log('Session saved:', currentSession.id);
}

// Tab created
chrome.tabs.onCreated.addListener(async (tab) => {
  if (!currentSession) await startNewSession();

  const tabEvent: TabEvent = {
    id: `tab_${Date.now()}_${tab.id}`,
    tabId: tab.id || 0,
    url: tab.url || '',
    title: tab.title || 'New Tab',
    timestamp: Date.now(),
    eventType: 'created',
    favicon: tab.favIconUrl,
  };

  currentSession?.tabs.push(tabEvent);
  logger.log('Tab created:', tabEvent);
});

// Tab updated
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (!currentSession) await startNewSession();

    const settings = await Storage.get<UserSettings>('settings');

    // Check if URL should be excluded
    if (settings?.excludedDomains.some((domain) => tab.url?.startsWith(domain))) {
      return;
    }

    const tabEvent: TabEvent = {
      id: `tab_${Date.now()}_${tabId}`,
      tabId,
      url: tab.url,
      title: tab.title || '',
      timestamp: Date.now(),
      eventType: 'updated',
      favicon: tab.favIconUrl,
    };

    currentSession?.tabs.push(tabEvent);
    logger.log('Tab updated:', tabEvent);
  }
});

// Tab activated
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const now = Date.now();

  // Save time spent on previous tab
  if (activeTabId !== null && currentSession) {
    const duration = now - activeTabStartTime;
    const lastEvent = currentSession.tabs.find((t) => t.tabId === activeTabId);
    if (lastEvent) {
      lastEvent.duration = (lastEvent.duration || 0) + duration;
    }
  }

  // Update active tab
  activeTabId = activeInfo.tabId;
  activeTabStartTime = now;

  if (!currentSession) await startNewSession();

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);

    const tabEvent: TabEvent = {
      id: `tab_${Date.now()}_${activeInfo.tabId}`,
      tabId: activeInfo.tabId,
      url: tab.url || '',
      title: tab.title || '',
      timestamp: now,
      eventType: 'activated',
      favicon: tab.favIconUrl,
    };

    currentSession?.tabs.push(tabEvent);
    logger.log('Tab activated:', tabEvent);
  } catch (error) {
    logger.error('Error getting active tab:', error);
  }
});

// Tab removed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  if (!currentSession) return;

  const tabEvent: TabEvent = {
    id: `tab_${Date.now()}_${tabId}`,
    tabId,
    url: '',
    title: '',
    timestamp: Date.now(),
    eventType: 'removed',
  };

  currentSession.tabs.push(tabEvent);
  logger.log('Tab removed:', tabEvent);
});

// Handle idle state
chrome.idle.onStateChanged.addListener(async (state) => {
  logger.log('Idle state changed:', state);

  if (state === 'locked' || state === 'idle') {
    // Save session when user goes idle
    await saveCurrentSession();
    currentSession = null;
  } else if (state === 'active') {
    // Start new session when user becomes active
    await startNewSession();
  }
});

// Periodic session save (every 5 minutes)
chrome.alarms.create('saveSession', { periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'saveSession' && currentSession) {
    await saveCurrentSession();
    await startNewSession();
  }
});

// Message handler
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  logger.log('Message received:', message);

  if (message.type === 'GET_CURRENT_SESSION') {
    sendResponse({ session: currentSession });
  } else if (message.type === 'GET_SETTINGS') {
    Storage.get<UserSettings>('settings').then(sendResponse);
    return true; // Keep channel open for async response
  }

  return false;
});

// Initialize on startup
startNewSession();
logger.log('Background service worker initialized');
