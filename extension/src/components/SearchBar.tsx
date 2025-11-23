// Search bar component with filters

import { useState, useEffect } from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import type { SearchFilters } from '@/utils/search';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  domains?: string[];
}

export function SearchBar({ onSearch, domains = [] }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [types, setTypes] = useState<SearchFilters['types']>([
    'tabs',
    'screenshots',
    'forms',
    'audio',
  ]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Debounce query to avoid too many searches while typing
  const debouncedQuery = useDebounce(query, 300);

  // Trigger search on filter changes
  useEffect(() => {
    const filters: SearchFilters = {
      query: debouncedQuery,
      types,
      domains: selectedDomains.length > 0 ? selectedDomains : undefined,
      dateFrom: dateFrom ? new Date(dateFrom).getTime() : undefined,
      dateTo: dateTo ? new Date(dateTo).getTime() : undefined,
    };
    onSearch(filters);
  }, [debouncedQuery, types, selectedDomains, dateFrom, dateTo, onSearch]);

  const handleClear = () => {
    setQuery('');
    setTypes(['tabs', 'screenshots', 'forms', 'audio']);
    setSelectedDomains([]);
    setDateFrom('');
    setDateTo('');
  };

  const toggleType = (type: SearchFilters['types'][number]) => {
    setTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const hasActiveFilters =
    query || types.length < 4 || selectedDomains.length > 0 || dateFrom || dateTo;

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all captures..."
          className="w-full pl-10 pr-20 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              title="Clear filters"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded transition ${
              showFilters
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
            }`}
            title="Show filters"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          {/* Content Types */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Content Types
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: 'tabs' as const, label: 'Tabs' },
                  { value: 'screenshots' as const, label: 'Screenshots' },
                  { value: 'forms' as const, label: 'Forms' },
                  { value: 'audio' as const, label: 'Audio' },
                ] as const
              ).map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleType(type.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
                    types.includes(type.value)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-3 h-3 inline mr-1" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="From"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="To"
              />
            </div>
          </div>

          {/* Domains */}
          {domains.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Domains ({domains.length})
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {domains.slice(0, 10).map((domain) => (
                  <label
                    key={domain}
                    className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDomains.includes(domain)}
                      onChange={() => toggleDomain(domain)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-gray-700 dark:text-gray-300 truncate">{domain}</span>
                  </label>
                ))}
                {domains.length > 10 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                    +{domains.length - 10} more domains
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
