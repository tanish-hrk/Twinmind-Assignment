// Audio capture utility for tab audio recording

import { Logger } from './logger';
import { Storage } from './storage';
import type { AudioCapture } from '@/types';

const logger = new Logger('AudioCapture');

export class AudioCaptureManager {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private currentCapture: AudioCapture | null = null;

  /**
   * Start capturing audio from a tab
   */
  async startCapture(tabId: number): Promise<AudioCapture | null> {
    try {
      logger.log('Starting audio capture for tab:', tabId);

      // Request tab audio stream
      const streamId = await this.requestTabAudioStream(tabId);
      if (!streamId) {
        logger.error('Failed to get audio stream ID');
        return null;
      }

      // Note: Audio capture from tabs requires using the stream directly from chrome.tabCapture
      // For now, we'll use a simplified approach that works with tabCapture permission
      const stream = await new Promise<MediaStream>((resolve, reject) => {
        chrome.tabCapture.capture({ audio: true, video: false }, (capturedStream) => {
          if (chrome.runtime.lastError || !capturedStream) {
            reject(new Error('Failed to capture audio stream'));
            return;
          }
          resolve(capturedStream);
        });
      });

      // Create audio capture record
      this.currentCapture = {
        id: `audio_${Date.now()}_${tabId}`,
        timestamp: Date.now(),
        duration: 0,
        status: 'capturing',
      };

      // Set up MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        await this.finalizeCapture();
      };

      this.mediaRecorder.onerror = (event) => {
        logger.error('MediaRecorder error:', event);
        this.currentCapture!.status = 'failed';
      };

      // Start recording
      this.mediaRecorder.start(1000); // Collect data every second
      logger.log('Audio capture started:', this.currentCapture.id);

      return this.currentCapture;
    } catch (error) {
      logger.error('Error starting audio capture:', error);
      if (this.currentCapture) {
        this.currentCapture.status = 'failed';
      }
      return null;
    }
  }

  /**
   * Stop current audio capture
   */
  async stopCapture(): Promise<void> {
    if (!this.mediaRecorder) {
      logger.warn('No active recording to stop');
      return;
    }

    try {
      logger.log('Stopping audio capture');
      this.mediaRecorder.stop();

      // Stop all tracks in the stream
      this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());

      this.mediaRecorder = null;
    } catch (error) {
      logger.error('Error stopping audio capture:', error);
    }
  }

  /**
   * Finalize capture and save audio
   */
  private async finalizeCapture(): Promise<void> {
    if (!this.currentCapture || this.audioChunks.length === 0) {
      logger.warn('No audio data to save');
      return;
    }

    try {
      // Create blob from audio chunks
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

      // Calculate duration
      const endTime = Date.now();
      this.currentCapture.duration = endTime - this.currentCapture.timestamp;

      // Convert to base64 for storage (in production, upload to Cloud Storage)
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);

      reader.onloadend = async () => {
        const base64data = reader.result as string;

        this.currentCapture!.audioUrl = base64data;
        this.currentCapture!.status = 'completed';

        // Save to storage
        const captures = (await Storage.get<AudioCapture[]>('audioCaptures')) || [];
        captures.push(this.currentCapture!);

        // Keep only last 10 captures (storage limitation)
        if (captures.length > 10) {
          captures.splice(0, captures.length - 10);
        }

        await Storage.set('audioCaptures', captures);
        logger.log('Audio capture saved:', this.currentCapture!.id);

        // Reset
        this.audioChunks = [];
        this.currentCapture = null;
      };
    } catch (error) {
      logger.error('Error finalizing audio capture:', error);
      if (this.currentCapture) {
        this.currentCapture.status = 'failed';
      }
    }
  }

  /**
   * Request audio stream ID from tab
   */
  private async requestTabAudioStream(_tabId: number): Promise<string | null> {
    return new Promise((resolve) => {
      chrome.tabCapture.capture(
        {
          audio: true,
          video: false,
        },
        (stream) => {
          if (chrome.runtime.lastError) {
            logger.error('Tab capture error:', chrome.runtime.lastError);
            resolve(null);
            return;
          }

          if (!stream) {
            logger.error('No stream returned from tabCapture');
            resolve(null);
            return;
          }

          // Get stream ID
          const streamId = stream.id;
          resolve(streamId);
        }
      );
    });
  }

  /**
   * Get all saved audio captures
   */
  static async getAllCaptures(): Promise<AudioCapture[]> {
    return (await Storage.get<AudioCapture[]>('audioCaptures')) || [];
  }

  /**
   * Delete an audio capture
   */
  static async deleteCapture(id: string): Promise<boolean> {
    try {
      const captures = await this.getAllCaptures();
      const filtered = captures.filter((c) => c.id !== id);
      await Storage.set('audioCaptures', filtered);
      return true;
    } catch (error) {
      logger.error('Error deleting audio capture:', error);
      return false;
    }
  }

  /**
   * Clear all audio captures
   */
  static async clearAll(): Promise<boolean> {
    try {
      await Storage.set('audioCaptures', []);
      return true;
    } catch (error) {
      logger.error('Error clearing audio captures:', error);
      return false;
    }
  }
}
