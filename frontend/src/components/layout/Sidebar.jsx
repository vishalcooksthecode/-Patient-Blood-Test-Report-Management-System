import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSidebar } from '../../store/slices/uiSlice';
import {
  FiHome, FiUsers, FiFileText, FiUpload, FiBarChart2,
  FiBell, FiSettings, FiX, FiActivity
} from 'react-icons/fi';
import { MdOutlineBiotech } from 'react-icons/md';

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: <FiHome size={18} /> },
  { to: '/admin/patients', label: 'Patients', icon: <FiUsers size={18} /> },
  { to: '/admin/reports', label: 'Reports', icon: <FiFileText size={18} /> },
  { to: '/admin/upload', label: 'Upload Report', icon: <FiUpload size={18} /> },
  { to: '/admin/users', label: 'Staff & Users', icon: <FiSettings size={18} /> },
  { to: '/admin/analytics', label: 'Analytics', icon: <FiBarChart2 size={18} /> },
];

const staffLinks = [
  { to: '/staff', label: 'Dashboard', icon: <FiHome size={18} /> },
  { to: '/staff/upload', label: 'Upload Report', icon: <FiUpload size={18} /> },
  { to: '/staff/reports', label: 'Reports', icon: <FiFileText size={18} /> },
  { to: '/staff/patients', label: 'Search Patients', icon: <FiUsers size={18} /> },
];

const patientLinks = [
  { to: '/patient', label: 'Dashboard', icon: <FiHome size={18} /> },
  { to: '/patient/reports', label: 'My Reports', icon: <FiFileText size={18} /> },
  { to: '/patient/notifications', label: 'Notifications', icon: <FiBell size={18} /> },
  { to: '/patient/profile', label: 'Profile', icon: <FiSettings size={18} /> },
];

const linksByRole = { admin: adminLinks, lab_staff: staffLinks, patient: patientLinks };

export default function Sidebar() {
  const { user } = useSelector((s) => s.auth);
  const { sidebarOpen } = useSelector((s) => s.ui);
  const dispatch = useDispatch();
  const links = linksByRole[user?.role] || [];

  return (
    <>
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => dispatch(setSidebar(false))} />}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 z-30 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <MdOutlineBiotech className="text-white" size={18} />
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm">MediLab Portal</span>
          </div>
          <button onClick={() => dispatch(setSidebar(false))} className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <FiX size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon }) => (
            <NavLink key={to} to={to} end={to.split('/').length === 2}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              {icon}
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2563eb&color=fff`}
              alt="avatar" className="w-8 h-8 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
