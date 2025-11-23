// Chrome Storage API wrapper with TypeScript support

export class Storage {
  /**
   * Get item from Chrome storage
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] ?? null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  /**
   * Get multiple items from Chrome storage
   */
  static async getMultiple<T extends Record<string, unknown>>(keys: string[]): Promise<Partial<T>> {
    try {
      const result = await chrome.storage.local.get(keys);
      return result as Partial<T>;
    } catch (error) {
      console.error('Storage getMultiple error:', error);
      return {};
    }
  }

  /**
   * Set item in Chrome storage
   */
  static async set<T>(key: string, value: T): Promise<boolean> {
    try {
      await chrome.storage.local.set({ [key]: value });
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }

  /**
   * Set multiple items in Chrome storage
   */
  static async setMultiple(items: Record<string, unknown>): Promise<boolean> {
    try {
      await chrome.storage.local.set(items);
      return true;
    } catch (error) {
      console.error('Storage setMultiple error:', error);
      return false;
    }
  }

  /**
   * Remove item from Chrome storage
   */
  static async remove(key: string): Promise<boolean> {
    try {
      await chrome.storage.local.remove(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  }

  /**
   * Clear all items from Chrome storage
   */
  static async clear(): Promise<boolean> {
    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Get storage usage statistics
   */
  static async getStats(): Promise<{ bytesInUse: number }> {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse();
      return { bytesInUse };
    } catch (error) {
      console.error('Storage stats error:', error);
      return { bytesInUse: 0 };
    }
  }
}
