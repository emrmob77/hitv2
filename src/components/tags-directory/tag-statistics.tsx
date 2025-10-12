import { Hash, TrendingUp, Calendar, BookmarkIcon } from 'lucide-react';

interface TagStatisticsProps {
  statistics: {
    totalTags: number;
    activeToday: number;
    newThisWeek: number;
    totalBookmarks: number;
  };
}

export function TagStatistics({ statistics }: TagStatisticsProps) {
  const stats = [
    {
      icon: Hash,
      label: 'Total Tags',
      value: statistics.totalTags.toLocaleString(),
      color: 'text-indigo-600 bg-indigo-100',
    },
    {
      icon: BookmarkIcon,
      label: 'Total Bookmarks',
      value: statistics.totalBookmarks.toLocaleString(),
      color: 'text-blue-600 bg-blue-100',
    },
    {
      icon: TrendingUp,
      label: 'Active Today',
      value: statistics.activeToday.toLocaleString(),
      color: 'text-green-600 bg-green-100',
    },
    {
      icon: Calendar,
      label: 'New This Week',
      value: statistics.newThisWeek.toLocaleString(),
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-neutral-900">Tag Statistics</h3>

      <div className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-neutral-600">{stat.label}</div>
                <div className="text-lg font-bold text-neutral-900">{stat.value}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
