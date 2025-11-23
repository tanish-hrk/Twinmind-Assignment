// Screenshot gallery component

import { useState, useEffect } from 'react';
import { Camera, Trash2, ExternalLink } from 'lucide-react';
import { ScreenshotManager } from '@/utils/screenshot';
import type { Screenshot } from '@/types';

export function ScreenshotGallery() {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);

  useEffect(() => {
    loadScreenshots();
  }, []);

  const loadScreenshots = async () => {
    const all = await ScreenshotManager.getAll();
    setScreenshots(all);
  };

  const handleCapture = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url) return;

      await ScreenshotManager.captureActiveTab(tab.url, tab.title);
      await loadScreenshots();
    } catch (error) {
      console.error('Error capturing screenshot:', error);
    }
  };

  const handleDelete = async (id: string) => {
    await ScreenshotManager.delete(id);
    setSelectedScreenshot(null);
    await loadScreenshots();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Capture Button */}
      <button
        onClick={handleCapture}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
      >
        <Camera className="w-5 h-5" />
        Capture Current Tab
      </button>

      {/* Gallery */}
      {screenshots.length > 0 ? (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Screenshots ({screenshots.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {screenshots.map((screenshot) => (
              <div
                key={screenshot.id}
                onClick={() => setSelectedScreenshot(screenshot)}
                className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition"
              >
                <img
                  src={screenshot.thumbnailUrl || screenshot.imageUrl}
                  alt="Screenshot"
                  className="w-full h-24 object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition">
                    <ExternalLink className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <div className="text-xs text-white truncate">
                    {new URL(screenshot.url).hostname}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No screenshots yet</p>
          <p className="text-xs mt-1">Capture your first screenshot above</p>
        </div>
      )}

      {/* Lightbox */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={selectedScreenshot.imageUrl}
                alt="Screenshot"
                className="w-full max-h-[70vh] object-contain"
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <a
                      href={selectedScreenshot.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium flex items-center gap-1 truncate"
                    >
                      {selectedScreenshot.url}
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(selectedScreenshot.timestamp)} •{' '}
                      {formatSize(selectedScreenshot.size)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedScreenshot.id)}
                    className="ml-3 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
                <button
                  onClick={() => setSelectedScreenshot(null)}
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
