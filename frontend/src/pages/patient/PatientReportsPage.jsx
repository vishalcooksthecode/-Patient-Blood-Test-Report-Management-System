import { useEffect, useState, useCallback } from 'react';
import { reportAPI } from '../../api/services';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { FiDownload, FiEye, FiSearch, FiShare2 } from 'react-icons/fi';
import { format } from 'date-fns';
import Modal from '../../components/common/Modal';

export default function PatientReportsPage() {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewReport, setViewReport] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await reportAPI.getAll({ page, limit: 10, search });
      setReports(data.reports); setTotal(data.total); setPages(data.pages);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleDownload = async (r) => {
    try {
      const { data } = await reportAPI.download(r._id);
      window.open(data.fileUrl, '_blank');
      toast.success('Report opened for download');
    } catch { toast.error('Download failed'); }
  };

  const handleShare = (r) => {
    navigator.clipboard?.writeText(window.location.origin + `/report/${r._id}`);
    toast.success('Report link copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Reports</h1>
        <p className="text-sm text-gray-500">{total} reports available</p>
      </div>

      <div className="relative max-w-sm">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input className="input-field pl-9" placeholder="Search by test name..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="grid gap-4">
        {loading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="card flex items-center gap-4">
            <div className="skeleton w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-48" /><div className="skeleton h-3 w-32" />
            </div>
          </div>
        )) : reports.length === 0 ? (
          <div className="card text-center py-12 text-gray-400">No reports found</div>
        ) : reports.map((r) => (
          <div key={r._id} className="card flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-medical-teal rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{r.fileType?.toUpperCase() || 'PDF'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white">{r.testName}</p>
                <p className="text-sm text-gray-500">{r.testCategory} · Dr. {r.doctorName || 'N/A'}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Test: {r.testDate ? format(new Date(r.testDate), 'MMM d, yyyy') : '—'} ·
                  Uploaded: {r.createdAt ? format(new Date(r.createdAt), 'MMM d, yyyy') : '—'} ·
                  Downloads: {r.downloadCount}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge status={r.status} />
              <button onClick={() => setViewReport(r)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"><FiEye size={16} /></button>
              <button onClick={() => handleDownload(r)} className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded-lg transition-colors"><FiDownload size={16} /></button>
              <button onClick={() => handleShare(r)} className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 rounded-lg transition-colors"><FiShare2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      <Pagination page={page} pages={pages} onPageChange={setPage} />

      <Modal open={!!viewReport} onClose={() => setViewReport(null)} title="Report Details">
        {viewReport && (
          <div className="space-y-3">
            {[
              ['Report ID', viewReport.reportId],
              ['Test Name', viewReport.testName],
              ['Category', viewReport.testCategory],
              ['Doctor', viewReport.doctorName || '—'],
              ['Test Date', viewReport.testDate ? format(new Date(viewReport.testDate), 'MMMM d, yyyy') : '—'],
              ['Status', viewReport.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm text-gray-500">{k}</span>
                <span className="text-sm font-medium">{k === 'Status' ? <Badge status={v} /> : v}</span>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <Button className="flex-1 justify-center" icon={<FiDownload size={14} />} onClick={() => { handleDownload(viewReport); setViewReport(null); }}>
                Download Report
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
