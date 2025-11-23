// Data visualization utilities

import type { TabEvent, Screenshot, FormData, AudioCapture } from '@/types';

export interface TimelineData {
  hour: number;
  count: number;
  label: string;
}

export interface DomainStat {
  domain: string;
  count: number;
  percentage: number;
}

export interface CaptureStats {
  tabs: number;
  screenshots: number;
  forms: number;
  audio: number;
  total: number;
}

export interface ActivityDay {
  date: string;
  count: number;
  timestamp: number;
}

/**
 * Visualization data processor
 */
export class VisualizationEngine {
  /**
   * Generate hourly timeline data for the last 24 hours
   */
  static generateTimeline(tabs: TabEvent[]): TimelineData[] {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // Initialize 24 hours
    const timeline: TimelineData[] = [];
    for (let i = 0; i < 24; i++) {
      const hour = new Date(now - (23 - i) * 60 * 60 * 1000).getHours();
      timeline.push({
        hour,
        count: 0,
        label: `${hour}:00`,
      });
    }

    // Count tabs per hour
    tabs
      .filter((tab) => tab.timestamp >= oneDayAgo)
      .forEach((tab) => {
        const hourIndex = Math.floor((tab.timestamp - oneDayAgo) / (60 * 60 * 1000));
        if (hourIndex >= 0 && hourIndex < 24) {
          timeline[hourIndex].count++;
        }
      });

    return timeline;
  }

  /**
   * Get top domains by visit count
   */
  static getTopDomains(tabs: TabEvent[], limit: number = 10): DomainStat[] {
    const domainCounts = new Map<string, number>();

    // Count occurrences
    tabs.forEach((tab) => {
      try {
        const hostname = new URL(tab.url).hostname;
        domainCounts.set(hostname, (domainCounts.get(hostname) || 0) + 1);
      } catch {
        // Invalid URL
      }
    });

    // Sort and calculate percentages
    const total = tabs.length;
    const sorted = Array.from(domainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([domain, count]) => ({
        domain,
        count,
        percentage: (count / total) * 100,
      }));

    return sorted;
  }

  /**
   * Calculate capture statistics
   */
  static getCaptureStats(
    tabs: TabEvent[],
    screenshots: Screenshot[],
    forms: FormData[],
    audio: AudioCapture[]
  ): CaptureStats {
    return {
      tabs: tabs.length,
      screenshots: screenshots.length,
      forms: forms.length,
      audio: audio.length,
      total: tabs.length + screenshots.length + forms.length + audio.length,
    };
  }

  /**
   * Generate daily activity for the last 7 days
   */
  static getDailyActivity(tabs: TabEvent[]): ActivityDay[] {
    const days: ActivityDay[] = [];
    const now = Date.now();

    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now - i * 24 * 60 * 60 * 1000);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const count = tabs.filter(
        (tab) => tab.timestamp >= dayStart.getTime() && tab.timestamp < dayEnd.getTime()
      ).length;

      days.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        count,
        timestamp: dayStart.getTime(),
      });
    }

    return days;
  }

  /**
   * Get activity heatmap data (hour x day of week)
   */
  static getActivityHeatmap(tabs: TabEvent[]): number[][] {
    // 7 days x 24 hours
    const heatmap: number[][] = Array(7)
      .fill(0)
      .map(() => Array(24).fill(0));

    tabs.forEach((tab) => {
      const date = new Date(tab.timestamp);
      const day = date.getDay(); // 0 = Sunday
      const hour = date.getHours();
      heatmap[day][hour]++;
    });

    return heatmap;
  }

  /**
   * Calculate average session duration
   */
  static getAverageSessionDuration(tabs: TabEvent[]): number {
    const sessions = new Map<string, { start: number; end: number }>();

    tabs.forEach((tab) => {
      if (!tab.url) return;

      const existing = sessions.get(tab.url);
      if (!existing || tab.timestamp < existing.start) {
        sessions.set(tab.url, {
          start: tab.timestamp,
          end: tab.timestamp + (tab.duration || 0),
        });
      } else if (tab.timestamp + (tab.duration || 0) > existing.end) {
        existing.end = tab.timestamp + (tab.duration || 0);
      }
    });

    if (sessions.size === 0) return 0;

    const totalDuration = Array.from(sessions.values()).reduce(
      (sum, session) => sum + (session.end - session.start),
      0
    );

    return totalDuration / sessions.size;
  }

  /**
   * Get content type distribution
   */
  static getContentTypeDistribution(
    tabs: TabEvent[],
    screenshots: Screenshot[],
    forms: FormData[],
    audio: AudioCapture[]
  ): Array<{ type: string; count: number; color: string }> {
    return [
      { type: 'Tabs', count: tabs.length, color: '#3b82f6' },
      { type: 'Screenshots', count: screenshots.length, color: '#10b981' },
      { type: 'Forms', count: forms.length, color: '#f59e0b' },
      { type: 'Audio', count: audio.length, color: '#ef4444' },
    ];
  }

  /**
   * Format duration for display
   */
  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Get productivity insights
   */
  static getProductivityInsights(tabs: TabEvent[]): {
    mostActiveHour: number;
    mostActiveDay: string;
    totalSites: number;
    averageTabsPerHour: number;
  } {
    if (tabs.length === 0) {
      return {
        mostActiveHour: 0,
        mostActiveDay: 'N/A',
        totalSites: 0,
        averageTabsPerHour: 0,
      };
    }

    // Most active hour
    const hourCounts = new Map<number, number>();
    tabs.forEach((tab) => {
      const hour = new Date(tab.timestamp).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    const mostActiveHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];

    // Most active day
    const dayCounts = new Map<number, number>();
    tabs.forEach((tab) => {
      const day = new Date(tab.timestamp).getDay();
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    });
    const mostActiveDayNum = Array.from(dayCounts.entries()).sort((a, b) => b[1] - a[1])[0][0];
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mostActiveDay = dayNames[mostActiveDayNum];

    // Total unique sites
    const uniqueDomains = new Set<string>();
    tabs.forEach((tab) => {
      try {
        uniqueDomains.add(new URL(tab.url).hostname);
      } catch {
        // Invalid URL
      }
    });

    // Average tabs per hour
    const timeRange =
      tabs.length > 0
        ? Math.max(...tabs.map((t) => t.timestamp)) - Math.min(...tabs.map((t) => t.timestamp))
        : 0;
    const hours = timeRange / (60 * 60 * 1000);
    const averageTabsPerHour = hours > 0 ? tabs.length / hours : 0;

    return {
      mostActiveHour,
      mostActiveDay,
      totalSites: uniqueDomains.size,
      averageTabsPerHour: Math.round(averageTabsPerHour * 10) / 10,
    };
  }
}
