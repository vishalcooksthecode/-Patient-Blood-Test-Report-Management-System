import { useEffect, useState, useCallback } from 'react';
import { patientAPI } from '../../api/services';
import { Table, Th, Td, Tr } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';

const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'view'
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await patientAPI.getAll({ page, limit: 10, search });
      setPatients(data.patients); setTotal(data.total); setPages(data.pages);
    } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const openAdd = () => { reset({}); setSelected(null); setModal('add'); };
  const openEdit = (p) => { reset({ ...p, dob: p.dob?.slice(0, 10) }); setSelected(p); setModal('edit'); };
  const openView = (p) => { setSelected(p); setModal('view'); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (modal === 'add') { await patientAPI.create(data); toast.success('Patient added'); }
      else { await patientAPI.update(selected._id, data); toast.success('Patient updated'); }
      setModal(null); fetchPatients();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this patient?')) return;
    await patientAPI.delete(id); toast.success('Patient deleted'); fetchPatients();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patients</h1>
          <p className="text-sm text-gray-500">{total} total patients</p>
        </div>
        <Button icon={<FiPlus size={16} />} onClick={openAdd}>Add Patient</Button>
      </div>

      <div className="card">
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input className="input-field pl-9" placeholder="Search by name, ID, mobile..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Patient ID</Th><Th>Name</Th><Th>Gender</Th><Th>Blood Group</Th><Th>Mobile</Th><Th>Registered</Th><Th>Actions</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? Array(5).fill(0).map((_, i) => (
              <Tr key={i}>
                {Array(7).fill(0).map((_, j) => <Td key={j}><div className="skeleton h-4 w-full" /></Td>)}
              </Tr>
            )) : patients.map((p) => (
              <Tr key={p._id}>
                <Td><span className="font-mono text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{p.patientId}</span></Td>
                <Td><span className="font-medium">{p.name}</span></Td>
                <Td className="capitalize">{p.gender}</Td>
                <Td><span className="font-semibold text-red-600">{p.bloodGroup || '—'}</span></Td>
                <Td>{p.mobile}</Td>
                <Td>{p.createdAt ? format(new Date(p.createdAt), 'MMM d, yyyy') : '—'}</Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openView(p)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"><FiEye size={14} /></button>
                    <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 rounded-lg transition-colors"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(p._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"><FiTrash2 size={14} /></button>
                  </div>
                </Td>
              </Tr>
            ))}
            {!loading && patients.length === 0 && (
              <Tr><Td colSpan={7} className="text-center text-gray-400 py-8">No patients found</Td></Tr>
            )}
          </tbody>
        </Table>
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modal === 'add' || modal === 'edit'} onClose={() => setModal(null)}
        title={modal === 'add' ? 'Add Patient' : 'Edit Patient'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name *" {...register('name', { required: true })} error={errors.name && 'Required'} />
          <Input label="Date of Birth *" type="date" {...register('dob', { required: true })} error={errors.dob && 'Required'} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender *</label>
            <select {...register('gender', { required: true })} className="input-field">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Blood Group</label>
            <select {...register('bloodGroup')} className="input-field">
              <option value="">Select</option>
              {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <Input label="Mobile *" {...register('mobile', { required: true })} error={errors.mobile && 'Required'} />
          <Input label="Email" type="email" {...register('email')} />
          <Input label="Address" {...register('address')} className="sm:col-span-2" />
          <Input label="Emergency Contact" {...register('emergencyContact')} />
          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>{modal === 'add' ? 'Add Patient' : 'Save Changes'}</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={modal === 'view'} onClose={() => setModal(null)} title="Patient Details">
        {selected && (
          <div className="space-y-3">
            {[
              ['Patient ID', selected.patientId],
              ['Name', selected.name],
              ['Date of Birth', selected.dob ? format(new Date(selected.dob), 'MMM d, yyyy') : '—'],
              ['Gender', selected.gender],
              ['Blood Group', selected.bloodGroup],
              ['Mobile', selected.mobile],
              ['Email', selected.email || '—'],
              ['Address', selected.address || '—'],
              ['Emergency Contact', selected.emergencyContact || '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm text-gray-500">{k}</span>
                <span className="text-sm font-medium capitalize">{v}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
