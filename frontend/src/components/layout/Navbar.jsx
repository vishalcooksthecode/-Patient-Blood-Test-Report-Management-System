import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiSun, FiMoon, FiBell, FiLogOut, FiUser } from 'react-icons/fi';
import { toggleDark, toggleSidebar } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';
import { markAllRead, fetchNotifications } from '../../store/slices/notificationSlice';
import { format } from 'date-fns';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode } = useSelector((s) => s.ui);
  const { user } = useSelector((s) => s.auth);
  const { items, unreadCount } = useSelector((s) => s.notifications);
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const profilePath = user?.role === 'patient' ? '/patient/profile' : user?.role === 'admin' ? '/admin/profile' : '/staff/profile';

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 z-20 flex items-center justify-between px-4 lg:px-6">
      <button onClick={() => dispatch(toggleSidebar())} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <FiMenu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <button onClick={() => dispatch(toggleDark())} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button onClick={() => { setShowNotif(!showNotif); setShowUser(false); dispatch(fetchNotifications()); }}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <FiBell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={() => dispatch(markAllRead())} className="text-xs text-primary-600 hover:underline">Mark all read</button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-center text-gray-400 py-6 text-sm">No notifications</p>
                ) : items.map((n) => (
                  <div key={n._id} className={`px-4 py-3 border-b border-gray-50 dark:border-gray-700 last:border-0 ${!n.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{format(new Date(n.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative">
          <button onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2563eb&color=fff`}
              alt="avatar" className="w-7 h-7 rounded-full object-cover" />
          </button>
          {showUser && (
            <div className="absolute right-0 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
              <button onClick={() => { navigate(profilePath); setShowUser(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <FiUser size={14} /> Profile
              </button>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <FiLogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
