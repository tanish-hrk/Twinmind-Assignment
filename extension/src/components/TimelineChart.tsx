// Timeline chart component (24-hour activity)

import { useMemo } from 'react';
import type { TimelineData } from '@/utils/visualization';

interface TimelineChartProps {
  data: TimelineData[];
}

export function TimelineChart({ data }: TimelineChartProps) {
  const maxCount = useMemo(() => Math.max(...data.map(d => d.count), 1), [data]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          24-Hour Activity
        </h3>
        <span className="text-xs text-gray-500">Last 24 hours</span>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        {/* Chart */}
        <div className="flex items-end gap-1 h-32">
          {data.map((item, index) => {
            const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            
            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-1 group"
              >
                {/* Bar */}
                <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600 relative"
                    style={{ height: `${height}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                  >
                    {/* Tooltip */}
                    {item.count > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
                        {item.count} {item.count === 1 ? 'tab' : 'tabs'}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels (every 4 hours) */}
        <div className="flex items-center gap-1 mt-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 text-center">
              {index % 4 === 0 && (
                <span className="text-xs text-gray-500">{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
