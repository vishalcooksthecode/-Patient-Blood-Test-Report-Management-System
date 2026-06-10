import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { reportAPI, patientAPI } from '../../api/services';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { FiUpload, FiFile, FiX, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const TEST_CATEGORIES = ['Hematology','Biochemistry','Microbiology','Immunology','Radiology','Cardiology','Pathology','Urology','Endocrinology','Other'];

export default function UploadReportPage() {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({ testName: '', testCategory: '', doctorName: '', testDate: '', status: 'pending' });
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const onDrop = useCallback((accepted) => {
    const f = accepted[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/pdf': [], 'image/jpeg': [], 'image/png': [] }, maxFiles: 1
  });

  const searchPatients = async () => {
    if (!patientSearch.trim()) return;
    setSearching(true);
    try {
      const { data } = await patientAPI.getAll({ search: patientSearch, limit: 5 });
      setPatients(data.patients);
    } finally { setSearching(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    if (!selectedPatient) return toast.error('Please select a patient');
    if (!form.testName || !form.testCategory || !form.testDate) return toast.error('Fill all required fields');

    const fd = new FormData();
    fd.append('file', file);
    fd.append('patientId', selectedPatient._id);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    setLoading(true);
    try {
      await reportAPI.upload(fd);
      toast.success('Report uploaded successfully!');
      navigate(user.role === 'admin' ? '/admin/reports' : '/staff/reports');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Report</h1>
        <p className="text-sm text-gray-500">Upload blood test reports for patients</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Search */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Select Patient</h2>
          <div className="flex gap-2">
            <input className="input-field flex-1" placeholder="Search patient by name, ID or mobile..."
              value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchPatients())} />
            <Button type="button" variant="secondary" icon={<FiSearch size={16} />} loading={searching} onClick={searchPatients}>Search</Button>
          </div>
          {patients.length > 0 && !selectedPatient && (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              {patients.map((p) => (
                <button key={p._id} type="button" onClick={() => { setSelectedPatient(p); setPatients([]); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-0 border-gray-100 dark:border-gray-600 transition-colors text-left">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.patientId} · {p.mobile}</p>
                  </div>
                  <span className="text-xs text-primary-600">Select →</span>
                </button>
              ))}
            </div>
          )}
          {selectedPatient && (
            <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-900/20 rounded-lg px-4 py-3">
              <div>
                <p className="font-medium text-sm">{selectedPatient.name}</p>
                <p className="text-xs text-gray-500">{selectedPatient.patientId} · {selectedPatient.bloodGroup}</p>
              </div>
              <button type="button" onClick={() => setSelectedPatient(null)} className="text-gray-400 hover:text-red-500"><FiX size={16} /></button>
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-900 dark:text-white">Report File</h2>
          {!file ? (
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'}`}>
              <input {...getInputProps()} />
              <FiUpload className="mx-auto text-gray-400 mb-3" size={32} />
              <p className="text-gray-600 dark:text-gray-300 font-medium">{isDragActive ? 'Drop file here' : 'Drag & drop or click to upload'}</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — max 10MB</p>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
              <div className="flex items-center gap-3">
                {preview ? <img src={preview} alt="preview" className="w-12 h-12 object-cover rounded-lg" /> : <FiFile className="text-primary-600" size={32} />}
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="text-gray-400 hover:text-red-500 p-1"><FiX size={16} /></button>
            </div>
          )}
        </div>

        {/* Report Details */}
        <div className="card grid grid-cols-1 sm:grid-cols-2 gap-4">
          <h2 className="font-semibold text-gray-900 dark:text-white sm:col-span-2">Report Details</h2>
          <Input label="Test Name *" placeholder="e.g. Complete Blood Count" value={form.testName}
            onChange={(e) => setForm({ ...form, testName: e.target.value })} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Category *</label>
            <select className="input-field" value={form.testCategory} onChange={(e) => setForm({ ...form, testCategory: e.target.value })} required>
              <option value="">Select category</option>
              {TEST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Doctor Name" placeholder="Dr. Name" value={form.doctorName}
            onChange={(e) => setForm({ ...form, doctorName: e.target.value })} />
          <Input label="Test Date *" type="date" value={form.testDate}
            onChange={(e) => setForm({ ...form, testDate: e.target.value })} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select className="input-field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={loading} icon={<FiUpload size={16} />}>Upload Report</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
