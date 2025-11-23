import { useState, useEffect } from 'react';
import { Brain, Activity, Settings, Clock } from 'lucide-react';
import type { BrowsingSession, UserSettings } from '@/types';
import { Storage } from '@/utils/storage';

function App() {
  const [currentSession, setCurrentSession] = useState<BrowsingSession | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'insights' | 'settings'>('activity');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Get current session from background
    chrome.runtime.sendMessage({ type: 'GET_CURRENT_SESSION' }, (response) => {
      if (response?.session) {
        setCurrentSession(response.session);
      }
    });

    // Get settings
    const storedSettings = await Storage.get<UserSettings>('settings');
    if (storedSettings) {
      setSettings(storedSettings);
    }
  };

  const toggleCapture = async () => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      captureEnabled: !settings.captureEnabled,
    };

    await Storage.set('settings', newSettings);
    setSettings(newSettings);
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getRecentTabs = () => {
    if (!currentSession) return [];

    // Get last 10 unique tabs
    const uniqueTabs = new Map();
    for (let i = currentSession.tabs.length - 1; i >= 0; i--) {
      const tab = currentSession.tabs[i];
      if (tab.url && !uniqueTabs.has(tab.url)) {
        uniqueTabs.set(tab.url, tab);
        if (uniqueTabs.size >= 10) break;
      }
    }
    return Array.from(uniqueTabs.values());
  };

  return (
    <div className="w-[400px] h-[600px] bg-white dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6" />
            <h1 className="text-xl font-bold">TwinMind</h1>
          </div>
          <button
            onClick={openOptions}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <Activity className="w-4 h-4" />
              <span>Tabs Tracked</span>
            </div>
            <div className="text-2xl font-bold">{currentSession?.tabs.length || 0}</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-3">
            <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
              <Clock className="w-4 h-4" />
              <span>Session Time</span>
            </div>
            <div className="text-2xl font-bold">
              {currentSession ? formatTime(Date.now() - currentSession.startTime) : '0s'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('activity')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition ${
            activeTab === 'activity'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Activity
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition ${
            activeTab === 'insights'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Insights
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'activity' && (
          <div className="space-y-3">
            {/* Capture Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Context Capture
              </span>
              <button
                onClick={toggleCapture}
                className={`relative w-12 h-6 rounded-full transition ${
                  settings?.captureEnabled ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings?.captureEnabled ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Recent Activity
              </h3>
              <div className="space-y-2">
                {getRecentTabs().length > 0 ? (
                  getRecentTabs().map((tab) => (
                    <div
                      key={tab.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition"
                    >
                      <div className="flex items-start gap-3">
                        {tab.favicon && (
                          <img src={tab.favicon} alt="" className="w-4 h-4 mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {tab.title || 'Untitled'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            {new URL(tab.url).hostname}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                    No activity yet
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="text-center py-12">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">AI insights coming soon...</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          TwinMind v0.1.0 • Amplifying human cognition
        </div>
      </div>
    </div>
  );
}

export default App;
