import { useEffect, useState } from 'react';
import { reportAPI } from '../../api/services';
import { useSelector } from 'react-redux';
import StatsCard from '../../components/common/StatsCard';
import Badge from '../../components/common/Badge';
import { FiFileText, FiDownload, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function PatientDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportAPI.getAll({ limit: 5 })
      .then(({ data }) => setReports(data.reports))
      .finally(() => setLoading(false));
  }, []);

  const totalDownloads = reports.reduce((s, r) => s + (r.downloadCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-medical-teal rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-blue-100 mt-1">Your health records are safe and accessible anytime.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Reports" value={reports.length} icon={<FiFileText size={20} />} color="blue" loading={loading} />
        <StatsCard title="Total Downloads" value={totalDownloads} icon={<FiDownload size={20} />} color="green" loading={loading} />
        <StatsCard title="Pending Reports" value={reports.filter((r) => r.status === 'pending').length} icon={<FiClock size={20} />} color="orange" loading={loading} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Reports</h2>
          <Link to="/patient/reports" className="text-sm text-primary-600 hover:underline">View all →</Link>
        </div>
        <div className="space-y-3">
          {loading ? Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="space-y-1.5 flex-1">
                <div className="skeleton h-4 w-48" />
                <div className="skeleton h-3 w-32" />
              </div>
            </div>
          )) : reports.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No reports uploaded yet</p>
          ) : reports.map((r) => (
            <div key={r._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <FiFileText className="text-primary-600" size={18} />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">{r.testName}</p>
                  <p className="text-xs text-gray-400">{r.testCategory} · {r.testDate ? format(new Date(r.testDate), 'MMM d, yyyy') : '—'}</p>
                </div>
              </div>
              <Badge status={r.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
