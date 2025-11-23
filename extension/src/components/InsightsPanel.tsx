// Insights panel component with productivity metrics

import { Clock, TrendingUp, Globe, Activity } from 'lucide-react';
import { VisualizationEngine } from '@/utils/visualization';
import type { TabEvent } from '@/types';

interface InsightsPanelProps {
  tabs: TabEvent[];
}

export function InsightsPanel({ tabs }: InsightsPanelProps) {
  const insights = VisualizationEngine.getProductivityInsights(tabs);
  const avgDuration = VisualizationEngine.getAverageSessionDuration(tabs);

  const metrics = [
    {
      icon: Clock,
      label: 'Most Active Hour',
      value: `${insights.mostActiveHour}:00`,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      icon: Activity,
      label: 'Most Active Day',
      value: insights.mostActiveDay,
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      icon: Globe,
      label: 'Unique Sites',
      value: insights.totalSites.toString(),
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      icon: TrendingUp,
      label: 'Avg Session',
      value: VisualizationEngine.formatDuration(avgDuration),
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Productivity Insights
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          
          return (
            <div
              key={metric.label}
              className={`${metric.bgColor} rounded-lg p-3 border border-gray-200 dark:border-gray-700`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${metric.color}`} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {metric.label}
                </span>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {metric.value}
              </div>
            </div>
          );
        })}
      </div>

      {tabs.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3 h-3 text-gray-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Activity Rate
            </span>
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{insights.averageTabsPerHour}</span> tabs per hour
          </div>
        </div>
      )}
    </div>
  );
}
