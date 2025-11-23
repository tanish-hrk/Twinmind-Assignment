// Search results display component

import { useState, useMemo } from 'react';
import { FileText, Camera, Mic, Globe } from 'lucide-react';
import { Pagination } from './Pagination';
import type { TabEvent, Screenshot, FormData, AudioCapture } from '@/types';
import type { SearchResult } from '@/utils/search';

interface SearchResultsProps {
  tabs: SearchResult<TabEvent>[];
  screenshots: SearchResult<Screenshot>[];
  forms: SearchResult<FormData>[];
  audio: SearchResult<AudioCapture>[];
  onTabClick?: (tab: TabEvent) => void;
  onScreenshotClick?: (screenshot: Screenshot) => void;
}

export function SearchResults({
  tabs,
  screenshots,
  forms,
  audio,
  onTabClick,
  onScreenshotClick,
}: SearchResultsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const totalResults = tabs.length + screenshots.length + forms.length + audio.length;

  // Combine and paginate all results
  const allResults = useMemo(() => {
    return [
      ...tabs.map((r) => ({ ...r, type: 'tab' as const })),
      ...screenshots.map((r) => ({ ...r, type: 'screenshot' as const })),
      ...forms.map((r) => ({ ...r, type: 'form' as const })),
      ...audio.map((r) => ({ ...r, type: 'audio' as const })),
    ].sort((a, b) => b.score - a.score);
  }, [tabs, screenshots, forms, audio]);

  const totalPages = Math.ceil(allResults.length / itemsPerPage);
  const paginatedResults = allResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when results change
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [allResults.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (totalResults === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <Globe className="w-12 h-12 mx-auto opacity-50" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">No results found</p>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
          Try adjusting your filters or search query
        </p>
      </div>
    );
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tab':
        return <Globe className="w-3 h-3" />;
      case 'screenshot':
        return <Camera className="w-3 h-3" />;
      case 'form':
        return <FileText className="w-3 h-3" />;
      case 'audio':
        return <Mic className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    const badges = {
      tab: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      screenshot: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      form: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      audio: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    };
    return badges[type as keyof typeof badges] || '';
  };

  return (
    <div className="space-y-4">
      {/* Results count */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>
          {totalResults} result{totalResults !== 1 ? 's' : ''} found
        </span>
        <span>
          {tabs.length > 0 && `${tabs.length} tabs`}
          {screenshots.length > 0 && ` • ${screenshots.length} screenshots`}
          {forms.length > 0 && ` • ${forms.length} forms`}
          {audio.length > 0 && ` • ${audio.length} audio`}
        </span>
      </div>

      {/* Unified paginated results */}
      <div className="space-y-2">
        {paginatedResults.map((result, index) => {
          const item = result.item as TabEvent & Screenshot & FormData & AudioCapture;

          return (
            <div
              key={`${result.type}-${item.id || index}`}
              className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition cursor-pointer"
              onClick={() => {
                if (result.type === 'tab' && onTabClick) {
                  onTabClick(item as TabEvent);
                } else if (result.type === 'screenshot' && onScreenshotClick) {
                  onScreenshotClick(item as Screenshot);
                }
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getTypeBadge(result.type)}`}
                    >
                      {getTypeIcon(result.type)}
                      {result.type}
                    </span>
                    {result.score > 1 && (
                      <span className="text-xs text-gray-400">Score: {result.score}</span>
                    )}
                  </div>

                  {result.type === 'tab' && (
                    <>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {(item as TabEvent).title || 'Untitled'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {(item as TabEvent).url}
                      </div>
                    </>
                  )}

                  {result.type === 'screenshot' && (
                    <>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        Screenshot
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {(item as Screenshot).url}
                      </div>
                    </>
                  )}

                  {result.type === 'form' && (
                    <>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {(item as FormData).formId || 'Form Submission'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {(item as FormData).url}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {(item as FormData).fields.length} field
                        {(item as FormData).fields.length !== 1 ? 's' : ''}
                      </div>
                    </>
                  )}

                  {result.type === 'audio' && (
                    <>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Audio Capture
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Duration: {Math.round((item as AudioCapture).duration / 1000)}s
                      </div>
                    </>
                  )}

                  <div className="text-xs text-gray-400 mt-1">{formatDate(item.timestamp)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalResults}
      />
    </div>
  );
}
