export default function StatsCard({ title, value, icon, color, subtitle, loading }) {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    teal: 'bg-teal-500',
  };

  if (loading) return (
    <div className="card">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-8 w-16 mb-2" />
      <div className="skeleton h-3 w-20" />
    </div>
  );

  return (
    <div className="card hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">{value?.toLocaleString() ?? '—'}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`${colors[color] || colors.blue} p-3 rounded-xl text-white group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
