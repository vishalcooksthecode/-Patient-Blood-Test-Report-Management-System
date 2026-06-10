import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAllRead } from '../../store/slices/notificationSlice';
import Button from '../../components/common/Button';
import { FiBell, FiCheck } from 'react-icons/fi';
import { format } from 'date-fns';

const typeColors = {
  report: 'bg-blue-500',
  password: 'bg-orange-500',
  profile: 'bg-green-500',
  system: 'bg-purple-500',
};

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { items, unreadCount, loading } = useSelector((s) => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-primary-600">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" icon={<FiCheck size={14} />} onClick={() => dispatch(markAllRead())}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="card text-center py-12">
            <FiBell className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-400">No notifications yet</p>
          </div>
        ) : items.map((n) => (
          <div key={n._id} className={`card flex items-start gap-4 transition-all ${!n.isRead ? 'border-l-4 border-l-primary-500' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${typeColors[n.type] || typeColors.system}`}>
              <FiBell className="text-white" size={14} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${!n.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{n.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
              <p className="text-xs text-gray-400 mt-1">{format(new Date(n.createdAt), 'MMM d, yyyy · h:mm a')}</p>
            </div>
            {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}
