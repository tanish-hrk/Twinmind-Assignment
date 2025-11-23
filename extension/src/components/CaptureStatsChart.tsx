// Capture statistics pie chart component

import { FileText, Camera, Mic, Globe } from 'lucide-react';
import type { CaptureStats } from '@/utils/visualization';

interface CaptureStatsChartProps {
  stats: CaptureStats;
}

export function CaptureStatsChart({ stats }: CaptureStatsChartProps) {
  const items = [
    { icon: Globe, label: 'Tabs', count: stats.tabs, color: 'bg-blue-500' },
    { icon: Camera, label: 'Screenshots', count: stats.screenshots, color: 'bg-green-500' },
    { icon: FileText, label: 'Forms', count: stats.forms, color: 'bg-amber-500' },
    { icon: Mic, label: 'Audio', count: stats.audio, color: 'bg-red-500' },
  ];

  const totalCount = stats.total;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Capture Statistics</h3>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        {/* Total */}
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalCount}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total Items Captured</div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            const percentage = totalCount > 0 ? (item.count / totalCount) * 100 : 0;

            return (
              <div
                key={item.label}
                className="bg-white dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`${item.color} p-1.5 rounded`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {item.label}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {item.count}
                </div>
                {totalCount > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
