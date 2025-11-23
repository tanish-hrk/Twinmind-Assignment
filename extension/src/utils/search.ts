// Search and filter utilities

import type { TabEvent, Screenshot, FormData, AudioCapture } from '@/types';

export interface SearchFilters {
  query: string;
  dateFrom?: number;
  dateTo?: number;
  types: ('tabs' | 'screenshots' | 'forms' | 'audio')[];
  domains?: string[];
}

export interface SearchResult<T> {
  item: T;
  score: number;
  matches: string[];
}

/**
 * Search utility class for filtering and ranking captured data
 */
export class SearchEngine {
  /**
   * Search through tab events
   */
  static searchTabs(tabs: TabEvent[], filters: SearchFilters): SearchResult<TabEvent>[] {
    if (!filters.types.includes('tabs')) return [];

    let filtered = tabs;

    // Date filter
    if (filters.dateFrom) {
      filtered = filtered.filter((t) => t.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter((t) => t.timestamp <= filters.dateTo!);
    }

    // Domain filter
    if (filters.domains && filters.domains.length > 0) {
      filtered = filtered.filter((t) => {
        try {
          const hostname = new URL(t.url).hostname;
          return filters.domains!.some((d) => hostname.includes(d));
        } catch {
          return false;
        }
      });
    }

    // Text search
    if (!filters.query) {
      return filtered.map((item) => ({ item, score: 1, matches: [] }));
    }

    const query = filters.query.toLowerCase();
    const results: SearchResult<TabEvent>[] = [];

    for (const tab of filtered) {
      const matches: string[] = [];
      let score = 0;

      // Search in title
      if (tab.title?.toLowerCase().includes(query)) {
        matches.push('title');
        score += 2;
      }

      // Search in URL
      if (tab.url.toLowerCase().includes(query)) {
        matches.push('url');
        score += 1;
      }

      if (score > 0) {
        results.push({ item: tab, score, matches });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Search through screenshots
   */
  static searchScreenshots(
    screenshots: Screenshot[],
    filters: SearchFilters
  ): SearchResult<Screenshot>[] {
    if (!filters.types.includes('screenshots')) return [];

    let filtered = screenshots;

    // Date filter
    if (filters.dateFrom) {
      filtered = filtered.filter((s) => s.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter((s) => s.timestamp <= filters.dateTo!);
    }

    // Domain filter
    if (filters.domains && filters.domains.length > 0) {
      filtered = filtered.filter((s) => {
        try {
          const hostname = new URL(s.url).hostname;
          return filters.domains!.some((d) => hostname.includes(d));
        } catch {
          return false;
        }
      });
    }

    // Text search
    if (!filters.query) {
      return filtered.map((item) => ({ item, score: 1, matches: [] }));
    }

    const query = filters.query.toLowerCase();
    const results: SearchResult<Screenshot>[] = [];

    for (const screenshot of filtered) {
      const matches: string[] = [];
      let score = 0;

      // Search in URL
      if (screenshot.url.toLowerCase().includes(query)) {
        matches.push('url');
        score += 2;
      }

      // Search in extracted text
      if (screenshot.extractedText?.toLowerCase().includes(query)) {
        matches.push('extractedText');
        score += 1;
      }

      if (score > 0) {
        results.push({ item: screenshot, score, matches });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Search through form submissions
   */
  static searchForms(forms: FormData[], filters: SearchFilters): SearchResult<FormData>[] {
    if (!filters.types.includes('forms')) return [];

    let filtered = forms;

    // Date filter
    if (filters.dateFrom) {
      filtered = filtered.filter((f) => f.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter((f) => f.timestamp <= filters.dateTo!);
    }

    // Domain filter
    if (filters.domains && filters.domains.length > 0) {
      filtered = filtered.filter((f) => {
        try {
          const hostname = new URL(f.url).hostname;
          return filters.domains!.some((d) => hostname.includes(d));
        } catch {
          return false;
        }
      });
    }

    // Text search
    if (!filters.query) {
      return filtered.map((item) => ({ item, score: 1, matches: [] }));
    }

    const query = filters.query.toLowerCase();
    const results: SearchResult<FormData>[] = [];

    for (const form of filtered) {
      const matches: string[] = [];
      let score = 0;

      // Search in URL
      if (form.url.toLowerCase().includes(query)) {
        matches.push('url');
        score += 2;
      }

      // Search in form ID
      if (form.formId?.toLowerCase().includes(query)) {
        matches.push('formId');
        score += 1;
      }

      // Search in field names (not values for privacy)
      for (const field of form.fields) {
        if (field.name.toLowerCase().includes(query) && !field.value.includes('[FILTERED]')) {
          matches.push(`field:${field.name}`);
          score += 0.5;
          break;
        }
      }

      if (score > 0) {
        results.push({ item: form, score, matches });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Search through audio captures
   */
  static searchAudio(audio: AudioCapture[], filters: SearchFilters): SearchResult<AudioCapture>[] {
    if (!filters.types.includes('audio')) return [];

    let filtered = audio;

    // Date filter
    if (filters.dateFrom) {
      filtered = filtered.filter((a) => a.timestamp >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter((a) => a.timestamp <= filters.dateTo!);
    }

    // Text search (in transcription if available)
    if (!filters.query) {
      return filtered.map((item) => ({ item, score: 1, matches: [] }));
    }

    const query = filters.query.toLowerCase();
    const results: SearchResult<AudioCapture>[] = [];

    for (const capture of filtered) {
      const matches: string[] = [];
      let score = 0;

      // Search in transcription
      if (capture.transcription?.toLowerCase().includes(query)) {
        matches.push('transcription');
        score += 2;
      }

      // Search in ID
      if (capture.id.toLowerCase().includes(query)) {
        matches.push('id');
        score += 0.5;
      }

      if (score > 0) {
        results.push({ item: capture, score, matches });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Get unique domains from tabs and screenshots
   */
  static getUniqueDomains(
    tabs: TabEvent[],
    screenshots: Screenshot[],
    forms: FormData[]
  ): string[] {
    const domains = new Set<string>();

    // From tabs
    tabs.forEach((tab) => {
      try {
        domains.add(new URL(tab.url).hostname);
      } catch {
        // Invalid URL
      }
    });

    // From screenshots
    screenshots.forEach((screenshot) => {
      try {
        domains.add(new URL(screenshot.url).hostname);
      } catch {
        // Invalid URL
      }
    });

    // From forms
    forms.forEach((form) => {
      try {
        domains.add(new URL(form.url).hostname);
      } catch {
        // Invalid URL
      }
    });

    return Array.from(domains).sort();
  }

  /**
   * Get date range from all data
   */
  static getDateRange(
    tabs: TabEvent[],
    screenshots: Screenshot[],
    forms: FormData[],
    audio: AudioCapture[]
  ): { min: number; max: number } | null {
    const timestamps = [
      ...tabs.map((t) => t.timestamp),
      ...screenshots.map((s) => s.timestamp),
      ...forms.map((f) => f.timestamp),
      ...audio.map((a) => a.timestamp),
    ];

    if (timestamps.length === 0) return null;

    return {
      min: Math.min(...timestamps),
      max: Math.max(...timestamps),
    };
  }
}
