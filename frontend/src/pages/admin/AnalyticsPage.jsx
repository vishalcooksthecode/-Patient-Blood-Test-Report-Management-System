import { useEffect, useState } from 'react';
import { analyticsAPI } from '../../api/services';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#2563eb','#0d9488','#16a34a','#d97706','#7c3aed','#db2777','#0891b2','#65a30d'];

export default function AnalyticsPage() {
  const [monthly, setMonthly] = useState([]);
  const [topTests, setTopTests] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([analyticsAPI.getMonthly(year), analyticsAPI.getTopTests()])
      .then(([m, t]) => {
        const filled = MONTHS.map((name, i) => ({
          name,
          reports: m.data.reports.find((r) => r._id === i + 1)?.count || 0,
          patients: m.data.patients.find((p) => p._id === i + 1)?.count || 0,
        }));
        setMonthly(filled);
        setTopTests(t.data.map((d) => ({ name: d._id, value: d.count })));
      })
      .finally(() => setLoading(false));
  }, [year]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500">Data insights and trends</p>
        </div>
        <select className="input-field w-28" value={year} onChange={(e) => setYear(+e.target.value)}>
          {[2022, 2023, 2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Area Chart */}
        <div className="card xl:col-span-2">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Reports & Registrations — {year}</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="reports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="patients" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} /><stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="reports" stroke="#2563eb" fill="url(#reports)" name="Reports" strokeWidth={2} />
              <Area type="monotone" dataKey="patients" stroke="#0d9488" fill="url(#patients)" name="New Patients" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Reports per Month</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="reports" fill="#2563eb" radius={[4, 4, 0, 0]} name="Reports" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Test Category Distribution</h2>
          {topTests.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={topTests} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {topTests.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {topTests.map((t, i) => (
                  <div key={t.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[100px]">{t.name}</span>
                    </div>
                    <span className="text-xs font-semibold">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-center text-gray-400 py-8 text-sm">No data available</p>}
        </div>
      </div>
    </div>
  );
}
