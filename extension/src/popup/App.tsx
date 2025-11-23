import { useState, useEffect } from 'react';
import { Brain, Activity, Settings, Clock, Camera, Mic, Download } from 'lucide-react';
import type {
  BrowsingSession,
  UserSettings,
  TabEvent,
  Screenshot,
  FormData as CapturedFormData,
  AudioCapture,
} from '@/types';
import { Storage } from '@/utils/storage';
import { AudioControls } from '@/components/AudioControls';
import { ScreenshotGallery } from '@/components/ScreenshotGallery';
import { PermissionRequest } from '@/components/PermissionRequest';
import { SearchBar } from '@/components/SearchBar';
import { SearchResults } from '@/components/SearchResults';
import { ExportModal } from '@/components/ExportModal';
import { TimelineChart } from '@/components/TimelineChart';
import { TopDomainsChart } from '@/components/TopDomainsChart';
import { CaptureStatsChart } from '@/components/CaptureStatsChart';
import { ActivityDaysChart } from '@/components/ActivityDaysChart';
import { InsightsPanel } from '@/components/InsightsPanel';
import { SearchEngine } from '@/utils/search';
import { VisualizationEngine } from '@/utils/visualization';
import type { Permission } from '@/utils/permissions';
import type { SearchFilters, SearchResult } from '@/utils/search';

function App() {
  const [currentSession, setCurrentSession] = useState<BrowsingSession | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'activity' | 'captures' | 'insights'>('activity');
  const [pendingPermission, setPendingPermission] = useState<Permission | null>(null);

  // Search state
  const [searchResults, setSearchResults] = useState<{
    tabs: SearchResult<TabEvent>[];
    screenshots: SearchResult<Screenshot>[];
    forms: SearchResult<CapturedFormData>[];
    audio: SearchResult<AudioCapture>[];
  } | null>(null);
  const [allTabs, setAllTabs] = useState<TabEvent[]>([]);
  const [allScreenshots, setAllScreenshots] = useState<Screenshot[]>([]);
  const [allForms, setAllForms] = useState<CapturedFormData[]>([]);
  const [allAudio, setAllAudio] = useState<AudioCapture[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    loadData();
    loadAllData();
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

  const loadAllData = async () => {
    // Load all tabs from all sessions
    const sessions = (await Storage.get<BrowsingSession[]>('sessions')) || [];
    const tabs = sessions.flatMap((s) => s.tabs);
    setAllTabs(tabs);

    // Load screenshots
    const screenshots = (await Storage.get<Screenshot[]>('screenshots')) || [];
    setAllScreenshots(screenshots);

    // Load forms
    const forms: CapturedFormData[] = (await Storage.get<CapturedFormData[]>('forms')) || [];
    setAllForms(forms);

    // Load audio
    const audio = (await Storage.get<AudioCapture[]>('audio')) || [];
    setAllAudio(audio);
  };

  const handleSearch = (filters: SearchFilters) => {
    const tabResults = SearchEngine.searchTabs(allTabs, filters);
    const screenshotResults = SearchEngine.searchScreenshots(allScreenshots, filters);
    const formResults = SearchEngine.searchForms(allForms, filters);
    const audioResults = SearchEngine.searchAudio(allAudio, filters);

    // Store categorized results
    setSearchResults({
      tabs: tabResults,
      screenshots: screenshotResults,
      forms: formResults,
      audio: audioResults,
    });
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
          onClick={() => setActiveTab('captures')}
          className={`flex-1 py-3 px-4 text-sm font-medium transition ${
            activeTab === 'captures'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          Captures
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
          <div className="space-y-4">
            {/* Capture Toggle & Export */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
              <button
                onClick={() => setShowExportModal(true)}
                className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                title="Export Data"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Search Interface */}
            <SearchBar
              domains={SearchEngine.getUniqueDomains(allTabs, allScreenshots, allForms)}
              onSearch={handleSearch}
            />

            {/* Search Results */}
            {searchResults && (
              <SearchResults
                tabs={searchResults.tabs}
                screenshots={searchResults.screenshots}
                forms={searchResults.forms}
                audio={searchResults.audio}
                onTabClick={(tab) => chrome.tabs.create({ url: tab.url })}
                onScreenshotClick={(screenshot) => {
                  // Open screenshot in new tab
                  const newTab = window.open();
                  if (newTab) {
                    newTab.document.write(`<img src="${screenshot.imageUrl}" alt="Screenshot" />`);
                  }
                }}
              />
            )}

            {/* Recent Activity (when no search) */}
            {!searchResults && (
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
            )}
          </div>
        )}

        {activeTab === 'captures' && (
          <div className="space-y-6">
            {/* Audio Captures */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Mic className="w-4 h-4" />
                Audio Recordings
              </h3>
              <AudioControls />
            </div>

            {/* Screenshots */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Screenshots
              </h3>
              <ScreenshotGallery />
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            {/* Insights Panel */}
            <InsightsPanel tabs={allTabs} />

            {/* Capture Statistics */}
            <CaptureStatsChart
              stats={VisualizationEngine.getCaptureStats(
                allTabs,
                allScreenshots,
                allForms,
                allAudio
              )}
            />

            {/* Weekly Activity */}
            <ActivityDaysChart data={VisualizationEngine.getDailyActivity(allTabs)} />

            {/* 24-Hour Timeline */}
            <TimelineChart data={VisualizationEngine.generateTimeline(allTabs)} />

            {/* Top Domains */}
            <TopDomainsChart data={VisualizationEngine.getTopDomains(allTabs, 5)} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3">
        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          TwinMind v0.1.0 • Amplifying human cognition
        </div>
      </div>

      {/* Permission Request Modal */}
      {pendingPermission && (
        <PermissionRequest
          permission={pendingPermission}
          onGranted={() => setPendingPermission(null)}
          onDenied={() => setPendingPermission(null)}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          tabs={allTabs}
          screenshots={allScreenshots}
          forms={allForms}
          audio={allAudio}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

export default App;
