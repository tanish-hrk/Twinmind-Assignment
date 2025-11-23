// Top domains bar chart component

import { Globe } from 'lucide-react';
import type { DomainStat } from '@/utils/visualization';

interface TopDomainsChartProps {
  data: DomainStat[];
}

export function TopDomainsChart({ data }: TopDomainsChartProps) {
  if (data.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Most Visited Sites
        </h3>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
          <Globe className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No browsing data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Most Visited Sites
      </h3>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
        {data.map((item, index) => (
          <div key={item.domain} className="space-y-1">
            {/* Domain info */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">
                  #{index + 1}
                </span>
                <span className="text-gray-900 dark:text-gray-100 truncate max-w-[180px]">
                  {item.domain}
                </span>
              </div>
              <span className="text-gray-500 font-medium">
                {item.count} {item.count === 1 ? 'visit' : 'visits'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
