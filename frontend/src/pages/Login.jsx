
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import {
  Stethoscope,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

export const Login = () => {
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.prefillEmail || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(
    location.state?.successMessage || ''
  );
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // If redirected with state, keep inputs updated
  useEffect(() => {
    if (location.state?.prefillEmail) {
      setEmail(location.state.prefillEmail);
    }

    if (location.state?.successMessage) {
      setSuccessMsg(location.state.successMessage);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });

      login(res.data);

      switch (res.data.role) {
        case 'patient':
          navigate('/dashboard/patient');
          break;
        case 'doctor':
          navigate('/dashboard/doctor');
          break;
        case 'receptionist':
          navigate('/dashboard/receptionist');
          break;
        case 'admin':
          navigate('/dashboard/admin');
          break;
        default:
          navigate('/');
          break;
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
          ? err.response.data.errors
              .map((e) => e.message)
              .join('. ')
          : err.response?.data?.message ||
            'Login failed. Please check credentials.';

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8 px-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 w-full max-w-md space-y-6 shadow-xl shadow-slate-200/50">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF0F2] border border-[#F6B2B2]/40 text-[#D87070] flex items-center justify-center mx-auto shadow-sm">
            <Stethoscope className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign In to CareQueue
          </h2>

          <p className="text-xs text-slate-500 font-normal">
            Access your personalized portal and live appointments
          </p>
        </div>

        {/* Success Message Banner */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {/* Error Message Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>

            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="name@hospital.com"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Password Field with Show/Hide Button */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="••••••••"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-11 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] rounded-md p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Registration Options Footer */}
        <div className="pt-3 border-t border-slate-100 text-center space-y-2.5">
          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-[#D87070] font-bold hover:underline"
            >
              Create an Account
            </Link>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span>Register as:</span>

            <Link
              to="/register?role=patient"
              className="text-slate-700 hover:text-[#D87070] px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-[#FDF0F2] border border-slate-200 transition-colors"
            >
              Patient
            </Link>

            <span className="text-slate-300">•</span>

            <Link
              to="/register?role=doctor"
              className="text-slate-700 hover:text-[#D87070] px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-[#FDF0F2] border border-slate-200 transition-colors"
            >
              Doctor
            </Link>

            <span className="text-slate-300">•</span>

            <Link
              to="/register?role=receptionist"
              className="text-slate-700 hover:text-[#D87070] px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-[#FDF0F2] border border-slate-200 transition-colors"
            >
              Receptionist
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
