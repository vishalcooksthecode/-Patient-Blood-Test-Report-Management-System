import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userAPI, authAPI } from '../../api/services';
import { setUser } from '../../store/slices/authSlice';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import { FiCamera, FiSave, FiLock } from 'react-icons/fi';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: user?.name || '', mobile: user?.mobile || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const fileRef = useRef();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      const updated = { ...user, name: data.name, mobile: data.mobile };
      dispatch(setUser(updated));
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Profile updated');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setPwSaving(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (e) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setPwSaving(false); }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append('avatar', file);
    try {
      const { data } = await userAPI.uploadAvatar(fd);
      const updated = { ...user, profilePicture: data.profilePicture };
      dispatch(setUser(updated));
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Avatar updated');
    } catch { toast.error('Upload failed'); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>

      {/* Avatar */}
      <div className="card flex items-center gap-6">
        <div className="relative">
          <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2563eb&color=fff&size=80`}
            alt="avatar" className="w-20 h-20 rounded-2xl object-cover" />
          <button onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
            <FiCamera size={12} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
        </div>
        <div>
          <p className="font-semibold text-lg text-gray-900 dark:text-white">{user?.name}</p>
          <p className="text-sm text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
          <p className="text-sm text-gray-400">{user?.email || user?.mobile}</p>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleUpdate} className="card space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <Input label="Email" value={user?.email || ''} disabled className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <input className="input-field bg-gray-50 dark:bg-gray-700 cursor-not-allowed capitalize" value={user?.role?.replace('_', ' ')} disabled />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={saving} icon={<FiSave size={14} />}>Save Changes</Button>
        </div>
      </form>

      {/* Password Form */}
      <form onSubmit={handlePasswordChange} className="card space-y-4">
        <h2 className="font-semibold text-gray-900 dark:text-white">Change Password</h2>
        <Input label="Current Password" type="password" value={pwForm.currentPassword}
          onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="New Password" type="password" value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
          <Input label="Confirm Password" type="password" value={pwForm.confirm}
            onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={pwSaving} icon={<FiLock size={14} />}>Update Password</Button>
        </div>
      </form>
    </div>
  );
}
