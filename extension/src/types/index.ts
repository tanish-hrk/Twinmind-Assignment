// Core data types for TwinMind

export interface TabEvent {
  id: string;
  tabId: number;
  url: string;
  title: string;
  timestamp: number;
  eventType: 'created' | 'updated' | 'activated' | 'removed';
  duration?: number;
  favicon?: string;
}

export interface BrowsingSession {
  id: string;
  startTime: number;
  endTime?: number;
  tabs: TabEvent[];
  totalActiveTime: number;
  activeTabId?: number;
}

export interface CapturedContext {
  id: string;
  timestamp: number;
  type: 'tab' | 'audio' | 'screenshot' | 'form' | 'search';
  data: TabEvent | AudioCapture | Screenshot | FormData | SearchQuery;
  metadata: {
    url?: string;
    title?: string;
    tags?: string[];
  };
}

export interface AudioCapture {
  id: string;
  timestamp: number;
  duration: number;
  audioUrl?: string;
  transcription?: string;
  status: 'capturing' | 'completed' | 'failed';
}

export interface Screenshot {
  id: string;
  timestamp: number;
  url: string;
  imageUrl: string;
  thumbnailUrl?: string;
  size: number;
  extractedText?: string;
}

export interface FormData {
  id: string;
  timestamp: number;
  url: string;
  formId?: string;
  fields: Array<{
    name: string;
    type: string;
    value: string;
  }>;
}

export interface SearchQuery {
  id: string;
  timestamp: number;
  query: string;
  searchEngine: string;
  url: string;
}

export interface UserSettings {
  captureEnabled: boolean;
  audioEnabled: boolean;
  screenshotEnabled: boolean;
  formTrackingEnabled: boolean;
  excludedDomains: string[];
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  dataRetentionDays: number;
}

export interface StorageStats {
  totalSize: number;
  usedSize: number;
  itemCount: number;
  lastCleanup: number;
}
