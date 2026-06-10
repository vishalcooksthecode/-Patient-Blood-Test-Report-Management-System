import { useEffect, useState } from 'react';
import { reportAPI } from '../../api/services';
import { useSelector } from 'react-redux';
import StatsCard from '../../components/common/StatsCard';
import Badge from '../../components/common/Badge';
import { FiFileText, FiUpload, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function StaffDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportAPI.getAll({ limit: 5 })
      .then(({ data }) => setReports(data.reports))
      .finally(() => setLoading(false));
  }, []);

  const today = reports.filter((r) => {
    const d = new Date(r.createdAt);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth();
  });

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-medical-teal to-primary-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">Lab Staff Dashboard</h1>
        <p className="text-blue-100 mt-1">Hello, {user?.name}! Manage and upload patient reports.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Total Reports" value={reports.length} icon={<FiFileText size={20} />} color="blue" loading={loading} />
        <StatsCard title="Uploaded Today" value={today.length} icon={<FiUpload size={20} />} color="green" loading={loading} />
        <StatsCard title="Pending" value={reports.filter((r) => r.status === 'pending').length} icon={<FiClock size={20} />} color="orange" loading={loading} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Reports</h2>
          <Link to="/staff/reports" className="text-sm text-primary-600 hover:underline">View all →</Link>
        </div>
        <div className="space-y-3">
          {loading ? Array(3).fill(0).map((_, i) => (
            <div key={i} className="skeleton h-14 w-full rounded-xl" />
          )) : reports.map((r) => (
            <div key={r._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <div>
                <p className="font-medium text-sm">{r.testName}</p>
                <p className="text-xs text-gray-400">{r.patientId?.name} · {r.testDate ? format(new Date(r.testDate), 'MMM d, yyyy') : '—'}</p>
              </div>
              <Badge status={r.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
