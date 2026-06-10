import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { login, clearError } from '../../store/slices/authSlice';
import { authAPI } from '../../api/services';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { FiMail, FiLock, FiUser } from 'react-icons/fi';
import { MdOutlineBiotech } from 'react-icons/md';

const schema = yup.object({ identifier: yup.string().required('Email or mobile required'), password: yup.string().required(), role: yup.string().required() });

const roleHome = { admin: '/admin', lab_staff: '/staff', patient: '/patient' };

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [forgotMode, setForgotMode] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [fpLoading, setFpLoading] = useState(false);
  const [fpData, setFpData] = useState({ identifier: '', otp: '', newPassword: '' });

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema), defaultValues: { role: 'patient' } });

  useEffect(() => { if (user) navigate(roleHome[user.role] || '/'); }, [user]);
  useEffect(() => { if (error) toast.error(error); return () => dispatch(clearError()); }, [error]);

  const onSubmit = (data) => dispatch(login({ identifier: data.identifier, password: data.password, role: data.role }));

  const handleForgot = async () => {
    setFpLoading(true);
    try {
      await authAPI.forgotPassword(fpData.identifier);
      setOtpSent(true);
      toast.success('OTP sent to your email');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error');
    } finally { setFpLoading(false); }
  };

  const handleReset = async () => {
    setFpLoading(true);
    try {
      await authAPI.resetPassword(fpData);
      toast.success('Password reset successfully');
      setForgotMode(false);
      setOtpSent(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid OTP');
    } finally { setFpLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-medical-teal flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <MdOutlineBiotech className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">MediLab Portal</h1>
          <p className="text-blue-200 mt-1">Healthcare Report Management System</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {!forgotMode ? (
            <>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Sign In</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input label="Email or Mobile" icon={<FiMail size={16} />} placeholder="Enter email or mobile"
                  {...register('identifier')} error={errors.identifier?.message} />

                <Input label="Password" type="password" icon={<FiLock size={16} />} placeholder="Enter password"
                  {...register('password')} error={errors.password?.message} />

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                  <div className="relative">
                    <FiUser size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select {...register('role')} className="input-field pl-10 appearance-none">
                      <option value="patient">Patient</option>
                      <option value="admin">Admin</option>
                      <option value="lab_staff">Lab Staff</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" className="rounded" /> Remember me
                  </label>
                  <button type="button" onClick={() => setForgotMode(true)} className="text-sm text-primary-600 hover:underline">
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full justify-center" loading={loading}>Sign In</Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <button onClick={() => { setForgotMode(false); setOtpSent(false); }} className="text-gray-400 hover:text-gray-600">←</button>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reset Password</h2>
              </div>
              <div className="space-y-4">
                <Input label="Email or Mobile" placeholder="Enter your email or mobile"
                  value={fpData.identifier} onChange={(e) => setFpData({ ...fpData, identifier: e.target.value })} />
                {!otpSent ? (
                  <Button className="w-full justify-center" loading={fpLoading} onClick={handleForgot}>Send OTP</Button>
                ) : (
                  <>
                    <Input label="Enter OTP" placeholder="6-digit OTP"
                      value={fpData.otp} onChange={(e) => setFpData({ ...fpData, otp: e.target.value })} />
                    <Input label="New Password" type="password" placeholder="New password"
                      value={fpData.newPassword} onChange={(e) => setFpData({ ...fpData, newPassword: e.target.value })} />
                    <Button className="w-full justify-center" loading={fpLoading} onClick={handleReset}>Reset Password</Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
