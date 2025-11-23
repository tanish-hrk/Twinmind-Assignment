// Shared TypeScript types for backend services

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  dataRetentionDays: number;
  aiInsightsEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface CapturedContext {
  id: string;
  userId: string;
  type: 'tab' | 'audio' | 'screenshot' | 'form' | 'search';
  timestamp: Date;
  data: Record<string, unknown>;
  metadata: ContextMetadata;
  processed: boolean;
  embedding?: number[];
}

export interface ContextMetadata {
  url?: string;
  title?: string;
  domain?: string;
  tags?: string[];
  sessionId?: string;
}

export interface Session {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  totalActiveTime: number;
  tabCount: number;
  contexts: string[]; // Context IDs
}

export interface Insight {
  id: string;
  userId: string;
  contextIds: string[];
  type: 'suggestion' | 'reminder' | 'connection' | 'summary';
  content: string;
  confidence: number;
  timestamp: Date;
  dismissed: boolean;
  feedback?: 'positive' | 'negative';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Request/Response DTOs
export interface CreateContextRequest {
  type: CapturedContext['type'];
  data: Record<string, unknown>;
  metadata: ContextMetadata;
}

export interface GetContextsRequest {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  types?: CapturedContext['type'][];
  page?: number;
  pageSize?: number;
}

export interface GenerateInsightRequest {
  userId: string;
  contextIds?: string[];
  type?: Insight['type'];
}

export interface UpdateUserSettingsRequest {
  dataRetentionDays?: number;
  aiInsightsEnabled?: boolean;
  notificationsEnabled?: boolean;
}
