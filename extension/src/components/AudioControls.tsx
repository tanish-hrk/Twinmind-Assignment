// Audio capture controls component

import { useState, useEffect } from 'react';
import { Mic, Square, Play, Trash2 } from 'lucide-react';
import { AudioCaptureManager } from '@/utils/audio-capture';
import type { AudioCapture } from '@/types';

export function AudioControls() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captures, setCaptures] = useState<AudioCapture[]>([]);
  const [audioManager] = useState(() => new AudioCaptureManager());

  useEffect(() => {
    loadCaptures();
  }, []);

  const loadCaptures = async () => {
    const allCaptures = await AudioCaptureManager.getAllCaptures();
    setCaptures(allCaptures);
  };

  const handleStartCapture = async () => {
    try {
      // Get active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      const capture = await audioManager.startCapture(tab.id);
      if (capture) {
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error starting capture:', error);
    }
  };

  const handleStopCapture = async () => {
    await audioManager.stopCapture();
    setIsCapturing(false);
    await loadCaptures();
  };

  const handleDelete = async (id: string) => {
    await AudioCaptureManager.deleteCapture(id);
    await loadCaptures();
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Recording Control */}
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 dark:text-white">Audio Capture</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {isCapturing ? 'Recording in progress...' : 'Click to start recording'}
            </div>
          </div>
          {isCapturing ? (
            <button
              onClick={handleStopCapture}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          ) : (
            <button
              onClick={handleStartCapture}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
            >
              <Mic className="w-4 h-4" />
              Start
            </button>
          )}
        </div>

        {isCapturing && (
          <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording...</span>
          </div>
        )}
      </div>

      {/* Captures List */}
      {captures.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Recent Captures ({captures.length})
          </h4>
          <div className="space-y-2">
            {captures.map((capture) => (
              <div
                key={capture.id}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded text-primary-600 dark:text-primary-400">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {new Date(capture.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDuration(capture.duration)}
                      {capture.status === 'completed' && ' • Completed'}
                      {capture.status === 'capturing' && ' • In progress'}
                      {capture.status === 'failed' && ' • Failed'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {capture.audioUrl && capture.status === 'completed' && (
                    <button
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
                      title="Play"
                    >
                      <Play className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(capture.id)}
                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
