// Activity days chart component (7-day overview)

import { useMemo } from 'react';
import type { ActivityDay } from '@/utils/visualization';

interface ActivityDaysChartProps {
  data: ActivityDay[];
}

export function ActivityDaysChart({ data }: ActivityDaysChartProps) {
  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Weekly Activity</h3>
        <span className="text-xs text-gray-500">Last 7 days</span>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        {/* Chart */}
        <div className="flex items-end gap-2 h-32">
          {data.map((day, index) => {
            const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
            const isToday = index === data.length - 1;

            return (
              <div key={day.timestamp} className="flex-1 flex flex-col items-center gap-2 group">
                {/* Bar */}
                <div className="w-full flex items-end justify-center" style={{ height: '100%' }}>
                  <div
                    className={`w-full rounded-t transition-all relative ${
                      isToday
                        ? 'bg-gradient-to-t from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500'
                        : 'bg-gray-400 dark:bg-gray-600 hover:bg-gray-500'
                    }`}
                    style={{ height: `${height}%`, minHeight: day.count > 0 ? '4px' : '0' }}
                  >
                    {/* Tooltip */}
                    {day.count > 0 && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                        {day.count} {day.count === 1 ? 'tab' : 'tabs'}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Day label */}
                <span
                  className={`text-xs ${
                    isToday
                      ? 'font-bold text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {day.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
