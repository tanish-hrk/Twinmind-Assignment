// Permission management utility for optional features

import { Logger } from './logger';

const logger = new Logger('Permissions');

export type Permission = 'tabCapture' | 'audioCapture';

export interface PermissionStatus {
  granted: boolean;
  requested: boolean;
}

export class PermissionManager {
  /**
   * Check if a permission is currently granted
   */
  static async isGranted(permission: Permission): Promise<boolean> {
    try {
      const permissions = await chrome.permissions.getAll();
      return permissions.permissions?.includes(permission) || false;
    } catch (error) {
      logger.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Request a specific permission
   */
  static async request(permission: Permission): Promise<boolean> {
    try {
      logger.log('Requesting permission:', permission);

      const granted = await chrome.permissions.request({
        permissions: [permission],
      });

      if (granted) {
        logger.log('Permission granted:', permission);
        // Store that we've requested this permission
        await chrome.storage.local.set({
          [`permission_${permission}_requested`]: true,
        });
      } else {
        logger.warn('Permission denied:', permission);
      }

      return granted;
    } catch (error) {
      logger.error('Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Remove a permission
   */
  static async revoke(permission: Permission): Promise<boolean> {
    try {
      const removed = await chrome.permissions.remove({
        permissions: [permission],
      });

      if (removed) {
        logger.log('Permission revoked:', permission);
      }

      return removed;
    } catch (error) {
      logger.error('Error revoking permission:', error);
      return false;
    }
  }

  /**
   * Get status of multiple permissions
   */
  static async getStatus(permissions: Permission[]): Promise<Record<Permission, PermissionStatus>> {
    const status: Record<string, PermissionStatus> = {};

    for (const permission of permissions) {
      const granted = await this.isGranted(permission);
      const requestedData = await chrome.storage.local.get(`permission_${permission}_requested`);
      const requested = requestedData[`permission_${permission}_requested`] || false;

      status[permission] = { granted, requested };
    }

    return status as Record<Permission, PermissionStatus>;
  }

  /**
   * Listen for permission changes
   */
  static onChanged(callback: (permissions: chrome.permissions.Permissions) => void): void {
    chrome.permissions.onAdded.addListener((permissions) => {
      logger.log('Permissions added:', permissions);
      callback(permissions);
    });

    chrome.permissions.onRemoved.addListener((permissions) => {
      logger.log('Permissions removed:', permissions);
      callback(permissions);
    });
  }
}
