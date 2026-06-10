export default function Badge({ status }) {
  const map = {
    pending: 'badge-pending',
    completed: 'badge-completed',
    reviewed: 'badge-reviewed',
    active: 'px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    inactive: 'px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
    locked: 'px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  };
  return <span className={map[status] || map.pending}>{status}</span>;
}
