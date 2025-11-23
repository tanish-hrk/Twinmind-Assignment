// Export modal component

import { useState } from 'react';
import { Download, X, FileJson, FileText } from 'lucide-react';
import type { TabEvent, Screenshot, FormData, AudioCapture } from '@/types';
import { DataExporter } from '@/utils/export';

interface ExportModalProps {
  tabs: TabEvent[];
  screenshots: Screenshot[];
  forms: FormData[];
  audio: AudioCapture[];
  onClose: () => void;
}

export function ExportModal({ tabs, screenshots, forms, audio, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [includeTypes, setIncludeTypes] = useState({
    tabs: true,
    screenshots: true,
    forms: true,
    audio: true,
  });

  const handleExport = () => {
    // Filter by date range if specified
    let filteredTabs = tabs;
    let filteredScreenshots = screenshots;
    let filteredForms = forms;
    let filteredAudio = audio;

    if (dateFrom) {
      const fromTimestamp = new Date(dateFrom).getTime();
      filteredTabs = filteredTabs.filter((t) => t.timestamp >= fromTimestamp);
      filteredScreenshots = filteredScreenshots.filter((s) => s.timestamp >= fromTimestamp);
      filteredForms = filteredForms.filter((f) => f.timestamp >= fromTimestamp);
      filteredAudio = filteredAudio.filter((a) => a.timestamp >= fromTimestamp);
    }

    if (dateTo) {
      const toTimestamp = new Date(dateTo).getTime() + 86400000; // End of day
      filteredTabs = filteredTabs.filter((t) => t.timestamp <= toTimestamp);
      filteredScreenshots = filteredScreenshots.filter((s) => s.timestamp <= toTimestamp);
      filteredForms = filteredForms.filter((f) => f.timestamp <= toTimestamp);
      filteredAudio = filteredAudio.filter((a) => a.timestamp <= toTimestamp);
    }

    // Filter by included types
    if (!includeTypes.tabs) filteredTabs = [];
    if (!includeTypes.screenshots) filteredScreenshots = [];
    if (!includeTypes.forms) filteredForms = [];
    if (!includeTypes.audio) filteredAudio = [];

    // Perform export
    DataExporter.exportFiltered(
      filteredTabs,
      filteredScreenshots,
      filteredForms,
      filteredAudio,
      format
    );

    onClose();
  };

  const totalItems =
    (includeTypes.tabs ? tabs.length : 0) +
    (includeTypes.screenshots ? screenshots.length : 0) +
    (includeTypes.forms ? forms.length : 0) +
    (includeTypes.audio ? audio.length : 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Export Data</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Export Format</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setFormat('json')}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition ${
                format === 'json'
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <FileJson className="w-5 h-5" />
              <span className="font-medium">JSON</span>
            </button>
            <button
              onClick={() => setFormat('csv')}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition ${
                format === 'csv'
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span className="font-medium">CSV</span>
            </button>
          </div>
        </div>

        {/* Date Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Date Range (Optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        {/* Content Types */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Include</label>
          <div className="space-y-2">
            {Object.entries(includeTypes).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setIncludeTypes({ ...includeTypes, [key]: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700 capitalize">{key}</span>
                <span className="text-xs text-gray-500 ml-auto">
                  (
                  {key === 'tabs'
                    ? tabs.length
                    : key === 'screenshots'
                      ? screenshots.length
                      : key === 'forms'
                        ? forms.length
                        : audio.length}{' '}
                  items)
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            Ready to export <span className="font-semibold text-gray-900">{totalItems}</span> items
            as <span className="font-semibold text-gray-900">{format.toUpperCase()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={totalItems === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
}
