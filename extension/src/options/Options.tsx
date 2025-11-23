import { useState, useEffect } from 'react';
import {
  Brain,
  Shield,
  Database,
  Mic,
  Camera,
  FileText,
  Moon,
  Sun,
  Trash2,
  Save,
} from 'lucide-react';
import type { UserSettings, StorageStats } from '@/types';
import { Storage } from '@/utils/storage';

function Options() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
    loadStorageStats();
  }, []);

  const loadSettings = async () => {
    const storedSettings = await Storage.get<UserSettings>('settings');
    if (storedSettings) {
      setSettings(storedSettings);
    }
  };

  const loadStorageStats = async () => {
    const stats = await Storage.getStats();
    setStorageStats({
      totalSize: 10485760, // 10MB quota
      usedSize: stats.bytesInUse,
      itemCount: 0,
      lastCleanup: Date.now(),
    });
  };

  const handleSave = async () => {
    if (!settings) return;

    await Storage.set('settings', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all captured data? This cannot be undone.')) {
      await Storage.set('sessions', []);
      await Storage.set('capturedContexts', []);
      loadStorageStats();
    }
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                TwinMind Settings
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure your AI second brain
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Capture Settings */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Data Capture
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    Enable Context Capture
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Capture browsing activity and context
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('captureEnabled', !settings.captureEnabled)}
                  className={`relative w-12 h-6 rounded-full transition ${
                    settings.captureEnabled ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.captureEnabled ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Audio Capture
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Capture and transcribe audio
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('audioEnabled', !settings.audioEnabled)}
                  className={`relative w-12 h-6 rounded-full transition ${
                    settings.audioEnabled ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.audioEnabled ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Screenshot Capture
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Capture visual context
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    updateSetting('screenshotEnabled', !settings.screenshotEnabled)
                  }
                  className={`relative w-12 h-6 rounded-full transition ${
                    settings.screenshotEnabled ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.screenshotEnabled ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Form Tracking
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Track form inputs (excluding passwords)
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    updateSetting('formTrackingEnabled', !settings.formTrackingEnabled)
                  }
                  className={`relative w-12 h-6 rounded-full transition ${
                    settings.formTrackingEnabled ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.formTrackingEnabled ? 'translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Privacy Settings */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Privacy & Security
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-medium text-gray-900 dark:text-white mb-2">
                  Data Retention (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={settings.dataRetentionDays}
                  onChange={(e) =>
                    updateSetting('dataRetentionDays', parseInt(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Data older than this will be automatically deleted
                </p>
              </div>

              <div>
                <label className="block font-medium text-gray-900 dark:text-white mb-2">
                  Excluded Domains
                </label>
                <textarea
                  value={settings.excludedDomains.join('\n')}
                  onChange={(e) =>
                    updateSetting('excludedDomains', e.target.value.split('\n'))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="chrome://&#10;chrome-extension://&#10;banking.example.com"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  One domain per line. These sites will never be tracked.
                </p>
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sun className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appearance
              </h2>
            </div>

            <div className="flex gap-3">
              {(['light', 'dark', 'auto'] as const).map((theme) => (
                <button
                  key={theme}
                  onClick={() => updateSetting('theme', theme)}
                  className={`flex-1 px-4 py-3 rounded-lg border-2 transition ${
                    settings.theme === theme
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {theme === 'light' && <Sun className="w-4 h-4" />}
                    {theme === 'dark' && <Moon className="w-4 h-4" />}
                    <span className="capitalize font-medium">{theme}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Storage */}
          <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Storage
                </h2>
              </div>
              <button
                onClick={handleClearData}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            </div>

            {storageStats && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Storage Used
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(storageStats.usedSize / 1024 / 1024).toFixed(2)} MB / 10 MB
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-600 transition-all"
                    style={{
                      width: `${(storageStats.usedSize / storageStats.totalSize) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-primary-600 hover:bg-primary-700 text-white'
            }`}
          >
            <Save className="w-5 h-5" />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Options;
