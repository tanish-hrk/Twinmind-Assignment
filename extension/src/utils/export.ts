// Data export utility

import type { TabEvent, Screenshot, FormData, AudioCapture } from '@/types';

export interface ExportData {
  tabs: TabEvent[];
  screenshots: Screenshot[];
  forms: FormData[];
  audio: AudioCapture[];
  exportDate: number;
  version: string;
}

export class DataExporter {
  /**
   * Export data as JSON
   */
  static exportAsJSON(data: ExportData): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    this.downloadBlob(blob, `twinmind-export-${Date.now()}.json`);
  }

  /**
   * Export data as CSV
   */
  static exportAsCSV(data: ExportData): void {
    const csvContent = this.convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    this.downloadBlob(blob, `twinmind-export-${Date.now()}.csv`);
  }

  /**
   * Convert data to CSV format
   */
  private static convertToCSV(data: ExportData): string {
    const rows: string[] = [];

    // CSV Header
    rows.push('Type,Timestamp,Date,URL,Title,Details,Duration,Status');

    // Tab events
    data.tabs.forEach((tab) => {
      rows.push(
        this.csvRow([
          'Tab',
          tab.timestamp.toString(),
          new Date(tab.timestamp).toISOString(),
          tab.url,
          tab.title || '',
          tab.eventType,
          tab.duration?.toString() || '',
          '',
        ])
      );
    });

    // Screenshots
    data.screenshots.forEach((screenshot) => {
      rows.push(
        this.csvRow([
          'Screenshot',
          screenshot.timestamp.toString(),
          new Date(screenshot.timestamp).toISOString(),
          screenshot.url,
          '',
          `Size: ${screenshot.size} bytes`,
          '',
          '',
        ])
      );
    });

    // Forms
    data.forms.forEach((form) => {
      rows.push(
        this.csvRow([
          'Form',
          form.timestamp.toString(),
          new Date(form.timestamp).toISOString(),
          form.url,
          form.formId || '',
          `${form.fields.length} fields`,
          '',
          '',
        ])
      );
    });

    // Audio
    data.audio.forEach((audio) => {
      rows.push(
        this.csvRow([
          'Audio',
          audio.timestamp.toString(),
          new Date(audio.timestamp).toISOString(),
          '',
          '',
          '',
          audio.duration.toString(),
          audio.status,
        ])
      );
    });

    return rows.join('\n');
  }

  /**
   * Create CSV row with proper escaping
   */
  private static csvRow(values: string[]): string {
    return values
      .map((value) => {
        // Escape quotes and wrap in quotes if contains comma or quote
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return '"' + value.replace(/"/g, '""') + '"';
        }
        return value;
      })
      .join(',');
  }

  /**
   * Download blob as file
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export filtered data
   */
  static exportFiltered(
    tabs: TabEvent[],
    screenshots: Screenshot[],
    forms: FormData[],
    audio: AudioCapture[],
    format: 'json' | 'csv'
  ): void {
    const data: ExportData = {
      tabs,
      screenshots,
      forms,
      audio,
      exportDate: Date.now(),
      version: '0.1.0',
    };

    if (format === 'json') {
      this.exportAsJSON(data);
    } else {
      this.exportAsCSV(data);
    }
  }
}
