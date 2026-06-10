import { useEffect, useState, useCallback } from 'react';
import { userAPI } from '../../api/services';
import { Table, Th, Td, Tr } from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import { FiPlus, FiSearch, FiKey, FiToggleLeft } from 'react-icons/fi';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getAll({ page, limit: 10, search, role });
      setUsers(data.users); setTotal(data.total); setPages(data.pages);
    } finally { setLoading(false); }
  }, [page, search, role]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const onCreateUser = async (data) => {
    setSaving(true);
    try {
      await userAPI.create(data); toast.success('User created'); setModal(null); fetchUsers();
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setSaving(false); }
  };

  const handleStatusToggle = async (u) => {
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    await userAPI.updateStatus(u._id, newStatus);
    toast.success(`User ${newStatus}`); fetchUsers();
  };

  const handleResetPassword = async (id) => {
    await userAPI.resetPassword(id, 'Medilab@123');
    toast.success('Password reset to Medilab@123');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff & Users</h1>
          <p className="text-sm text-gray-500">{total} users</p>
        </div>
        <Button icon={<FiPlus size={16} />} onClick={() => { reset({}); setModal('add'); }}>Create User</Button>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input className="input-field pl-9" placeholder="Search by name or email..."
              value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input-field w-36" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="lab_staff">Lab Staff</option>
            <option value="patient">Patient</option>
          </select>
        </div>

        <Table>
          <thead>
            <tr><Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Status</Th><Th>Created</Th><Th>Actions</Th></tr>
          </thead>
          <tbody>
            {loading ? Array(5).fill(0).map((_, i) => (
              <Tr key={i}>{Array(6).fill(0).map((_, j) => <Td key={j}><div className="skeleton h-4 w-full" /></Td>)}</Tr>
            )) : users.map((u) => (
              <Tr key={u._id}>
                <Td>
                  <div className="flex items-center gap-2">
                    <img src={u.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=2563eb&color=fff&size=32`}
                      alt="" className="w-7 h-7 rounded-full" />
                    <span className="font-medium text-sm">{u.name}</span>
                  </div>
                </Td>
                <Td>{u.email || u.mobile || '—'}</Td>
                <Td><span className="capitalize text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">{u.role?.replace('_', ' ')}</span></Td>
                <Td><Badge status={u.status} /></Td>
                <Td>{u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}</Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleStatusToggle(u)} title="Toggle status"
                      className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 rounded-lg transition-colors">
                      <FiToggleLeft size={14} />
                    </button>
                    <button onClick={() => handleResetPassword(u._id)} title="Reset password"
                      className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors">
                      <FiKey size={14} />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
            {!loading && users.length === 0 && (
              <Tr><Td colSpan={6} className="text-center text-gray-400 py-8">No users found</Td></Tr>
            )}
          </tbody>
        </Table>
        <Pagination page={page} pages={pages} onPageChange={setPage} />
      </div>

      <Modal open={modal === 'add'} onClose={() => setModal(null)} title="Create User">
        <form onSubmit={handleSubmit(onCreateUser)} className="space-y-4">
          <Input label="Full Name *" {...register('name', { required: true })} error={errors.name && 'Required'} />
          <Input label="Email" type="email" {...register('email')} />
          <Input label="Mobile" {...register('mobile')} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role *</label>
            <select {...register('role', { required: true })} className="input-field">
              <option value="">Select role</option>
              <option value="lab_staff">Lab Staff</option>
              <option value="admin">Admin</option>
              <option value="patient">Patient</option>
            </select>
          </div>
          <Input label="Password *" type="password" {...register('password', { required: true })} error={errors.password && 'Required'} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
