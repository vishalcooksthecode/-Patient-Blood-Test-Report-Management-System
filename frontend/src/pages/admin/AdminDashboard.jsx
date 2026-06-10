import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../api/services';
import StatsCard from '../../components/common/StatsCard';
import { FiUsers, FiFileText, FiUpload, FiClock, FiActivity } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#2563eb','#0d9488','#16a34a','#d97706','#7c3aed','#db2777','#0891b2','#65a30d'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [topTests, setTopTests] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([analyticsAPI.getStats(), analyticsAPI.getMonthly(), analyticsAPI.getTopTests(), analyticsAPI.getActivity()])
      .then(([s, m, t, a]) => {
        setStats(s.data);
        const filled = MONTHS.map((name, i) => ({
          name,
          reports: m.data.reports.find((r) => r._id === i + 1)?.count || 0,
          patients: m.data.patients.find((p) => p._id === i + 1)?.count || 0,
        }));
        setMonthly(filled);
        setTopTests(t.data.map((d) => ({ name: d._id, value: d.count })));
        setActivity(a.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatsCard title="Total Patients" value={stats?.totalPatients} icon={<FiUsers size={20} />} color="blue" loading={loading} />
        <StatsCard title="Total Reports" value={stats?.totalReports} icon={<FiFileText size={20} />} color="teal" loading={loading} />
        <StatsCard title="Uploaded Today" value={stats?.todayReports} icon={<FiUpload size={20} />} color="green" loading={loading} />
        <StatsCard title="Pending Reports" value={stats?.pendingReports} icon={<FiClock size={20} />} color="orange" loading={loading} />
        <StatsCard title="Active Users" value={stats?.activeUsers} icon={<FiActivity size={20} />} color="purple" loading={loading} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Monthly Line Chart */}
        <div className="card xl:col-span-2">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Overview ({new Date().getFullYear()})</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="reports" stroke="#2563eb" strokeWidth={2} dot={false} name="Reports" />
              <Line type="monotone" dataKey="patients" stroke="#0d9488" strokeWidth={2} dot={false} name="Patients" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Tests Pie */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Test Categories</h2>
          {topTests.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={topTests} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {topTests.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {topTests.slice(0, 5).map((t, i) => (
                  <div key={t.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 dark:text-gray-300 truncate max-w-[120px]">{t.name}</span>
                    </div>
                    <span className="font-medium">{t.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <p className="text-gray-400 text-sm text-center py-8">No data yet</p>}
        </div>
      </div>

      {/* Bar Chart + Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card xl:col-span-2">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Reports Uploaded</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="reports" fill="#2563eb" radius={[4, 4, 0, 0]} name="Reports" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="card overflow-hidden">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {activity.length === 0 ? <p className="text-gray-400 text-sm">No activity yet</p> : activity.map((log) => (
              <div key={log._id} className="flex items-start gap-2">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                <div>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{log.action}</p>
                  <p className="text-xs text-gray-400">{log.userId?.name || 'Unknown'} · {new Date(log.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
