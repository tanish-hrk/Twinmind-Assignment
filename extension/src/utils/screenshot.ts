// Screenshot capture utility

import { Logger } from './logger';
import { Storage } from './storage';
import type { Screenshot } from '@/types';

const logger = new Logger('Screenshot');

export class ScreenshotManager {
  /**
   * Capture screenshot of the current active tab
   */
  static async captureActiveTab(url: string, _title?: string): Promise<Screenshot | null> {
    try {
      logger.log('Capturing screenshot for:', url);

      // Capture visible tab (use chrome.windows.WINDOW_ID_CURRENT for current window)
      const dataUrl = await chrome.tabs.captureVisibleTab({
        format: 'png',
        quality: 90,
      });

      // Create screenshot object
      const screenshot: Screenshot = {
        id: `screenshot_${Date.now()}`,
        timestamp: Date.now(),
        url,
        imageUrl: dataUrl,
        size: this.estimateSize(dataUrl),
      };

      // Generate thumbnail (compressed version)
      screenshot.thumbnailUrl = await this.generateThumbnail(dataUrl);

      // Save to storage
      await this.saveScreenshot(screenshot);

      logger.log('Screenshot captured:', screenshot.id);
      return screenshot;
    } catch (error) {
      logger.error('Error capturing screenshot:', error);
      return null;
    }
  }

  /**
   * Capture screenshot with specific trigger
   */
  static async captureWithTrigger(
    tabId: number,
    trigger: 'manual' | 'form_submit' | 'error' | 'key_moment'
  ): Promise<Screenshot | null> {
    try {
      // Get tab info
      const tab = await chrome.tabs.get(tabId);
      if (!tab.url) return null;

      const screenshot = await this.captureActiveTab(tab.url, tab.title);

      if (screenshot) {
        // Store trigger metadata
        await Storage.set(`screenshot_trigger_${screenshot.id}`, trigger);
      }

      return screenshot;
    } catch (error) {
      logger.error('Error capturing with trigger:', error);
      return null;
    }
  }

  /**
   * Generate thumbnail from full image
   */
  private static async generateThumbnail(dataUrl: string): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;

        // Thumbnail size
        const maxWidth = 200;
        const maxHeight = 150;

        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL with compression
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.src = dataUrl;
    });
  }

  /**
   * Extract visible text from page (to be called from content script)
   */
  static async extractVisibleText(tabId: number): Promise<string | null> {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          // Get visible text from page
          const body = document.body;
          const text = body.innerText || body.textContent || '';

          // Limit to first 5000 characters
          return text.substring(0, 5000);
        },
      });

      return results[0]?.result || null;
    } catch (error) {
      logger.error('Error extracting visible text:', error);
      return null;
    }
  }

  /**
   * Save screenshot to storage
   */
  private static async saveScreenshot(screenshot: Screenshot): Promise<void> {
    try {
      const screenshots = (await Storage.get<Screenshot[]>('screenshots')) || [];
      screenshots.push(screenshot);

      // Keep only last 20 screenshots (storage limitation)
      if (screenshots.length > 20) {
        screenshots.splice(0, screenshots.length - 20);
      }

      await Storage.set('screenshots', screenshots);
    } catch (error) {
      logger.error('Error saving screenshot:', error);
      throw error;
    }
  }

  /**
   * Get all screenshots
   */
  static async getAll(): Promise<Screenshot[]> {
    return (await Storage.get<Screenshot[]>('screenshots')) || [];
  }

  /**
   * Get screenshots for a specific URL
   */
  static async getByUrl(url: string): Promise<Screenshot[]> {
    const all = await this.getAll();
    return all.filter((s) => s.url === url);
  }

  /**
   * Delete a screenshot
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const screenshots = await this.getAll();
      const filtered = screenshots.filter((s) => s.id !== id);
      await Storage.set('screenshots', filtered);
      return true;
    } catch (error) {
      logger.error('Error deleting screenshot:', error);
      return false;
    }
  }

  /**
   * Clear all screenshots
   */
  static async clearAll(): Promise<boolean> {
    try {
      await Storage.set('screenshots', []);
      return true;
    } catch (error) {
      logger.error('Error clearing screenshots:', error);
      return false;
    }
  }

  /**
   * Estimate size of data URL in bytes
   */
  private static estimateSize(dataUrl: string): number {
    // Base64 encoded, each character is ~0.75 bytes
    return Math.round((dataUrl.length * 3) / 4);
  }

  /**
   * Get total storage used by screenshots
   */
  static async getTotalSize(): Promise<number> {
    const screenshots = await this.getAll();
    return screenshots.reduce((total, s) => total + s.size, 0);
  }
}
