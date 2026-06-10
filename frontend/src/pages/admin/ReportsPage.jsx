import { useEffect, useState, useCallback } from 'react';
import { reportAPI } from '../../api/services';
import { Table, Th, Td, Tr } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { FiSearch, FiDownload, FiTrash2, FiEye, FiFilter, FiPlus } from 'react-icons/fi';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const STATUS_OPTIONS = ['', 'pending', 'completed', 'reviewed'];
const CATEGORIES = ['','Hematology','Biochemistry','Microbiology','Immunology','Radiology','Cardiology','Pathology','Urology','Endocrinology','Other'];

export default function ReportsPage() {
  const { user } = useSelector((s) => s.auth);
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: '', category: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [viewReport, setViewReport] = useState(null);
  const uploadPath = user?.role === 'admin' ? '/admin/upload' : '/staff/upload';

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await reportAPI.getAll({ page, limit: 10, ...filters });
      setReports(data.reports); setTotal(data.total); setPages(data.pages);
    } finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleDownload = async (r) => {
    try {
      const { data } = await reportAPI.download(r._id);
      window.open(data.fileUrl, '_blank');
      toast.success(`Downloaded (total: ${data.downloadCount})`);
    } catch { toast.error('Download failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this report?')) return;
    await reportAPI.delete(id); toast.success('Report deleted'); fetchReports();
  };

  const handleStatusChange = async (id, status) => {
    await reportAPI.updateStatus(id, status);
    toast.success('Status updated');
    fetchReports();
  };

  const setFilter = (key, val) => { setFilters((f) => ({ ...f, [key]: val })); setPage(1); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="text-sm text-gray-500">{total} total reports</p>
        </div>
        <Link to={uploadPath}><Button icon={<FiPlus size={16} />}>Upload Report</Button></Link>
      </div>

      <div className="card space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input className="input-field pl-9" placeholder="Search by test name, report ID..."
              value={filters.search} onChange={(e) => setFilter('search', e.target.value)} />
          </div>
          <select className="input-field w-36" value={filters.status} onChange={(e) => setFilter('status', e.target.value)}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All Status'}</option>)}
          </select>
          <select className="input-field w-44" value={filters.category} onChange={(e) => setFilter('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
          <input type="date" className="input-field w-40" value={filters.startDate} onChange={(e) => setFilter('startDate', e.target.value)} />
          <input type="date" className="input-field w-40" value={filters.endDate} onChange={(e) => setFilter('endDate', e.target.value)} />
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Report ID</Th><Th>Patient</Th><Th>Test Name</Th><Th>Category</Th>
              <Th>Test Date</Th><Th>Status</Th><Th>Downloads</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? Array(6).fill(0).map((_, i) => (
              <Tr key={i}>{Array(8).fill(0).map((_, j) => <Td key={j}><div className="skeleton h-4 w-full" /></Td>)}</Tr>
            )) : reports.map((r) => (
              <Tr key={r._id}>
                <Td><span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{r.reportId}</span></Td>
                <Td>
                  <p className="font-medium text-sm">{r.patientId?.name}</p>
                  <p className="text-xs text-gray-400">{r.patientId?.patientId}</p>
                </Td>
                <Td>{r.testName}</Td>
                <Td><span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">{r.testCategory}</span></Td>
                <Td>{r.testDate ? format(new Date(r.testDate), 'MMM d, yyyy') : '—'}</Td>
                <Td>
                  <select value={r.status} onChange={(e) => handleStatusChange(r._id, e.target.value)}
                    className="text-xs border-0 bg-transparent cursor-pointer focus:outline-none">
                    <option value="pending">pending</option>
                    <option value="completed">completed</option>
                    <option value="reviewed">reviewed</option>
                  </select>
                </Td>
                <Td><span className="text-xs text-gray-500">{r.downloadCount}</span></Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setViewReport(r)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"><FiEye size={14} /></button>
                    <button onClick={() => handleDownload(r)} className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded-lg transition-colors"><FiDownload size={14} /></button>
                    {user?.role === 'admin' && <button onClick={() => handleDelete(r._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"><FiTrash2 size={14} /></button>}
                  </div>
                </Td>
              </Tr>
            ))}
            {!loading && reports.length === 0 && (
              <Tr><Td colSpan={8} className="text-center text-gray-400 py-8">No reports found</Td></Tr>
            )}
          </tbody>
        </Table>
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>

      {/* View Report Modal */}
      <Modal open={!!viewReport} onClose={() => setViewReport(null)} title="Report Details">
        {viewReport && (
          <div className="space-y-3">
            {[
              ['Report ID', viewReport.reportId],
              ['Patient', viewReport.patientId?.name],
              ['Patient ID', viewReport.patientId?.patientId],
              ['Test Name', viewReport.testName],
              ['Category', viewReport.testCategory],
              ['Doctor', viewReport.doctorName || '—'],
              ['Test Date', viewReport.testDate ? format(new Date(viewReport.testDate), 'MMM d, yyyy') : '—'],
              ['Upload Date', viewReport.createdAt ? format(new Date(viewReport.createdAt), 'MMM d, yyyy') : '—'],
              ['Status', viewReport.status],
              ['Downloads', viewReport.downloadCount],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm text-gray-500">{k}</span>
                <span className="text-sm font-medium">{k === 'Status' ? <Badge status={v} /> : v}</span>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 justify-center" icon={<FiDownload size={14} />} onClick={() => { handleDownload(viewReport); setViewReport(null); }}>
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
