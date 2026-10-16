import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { 
  UserPlus, 
  Stethoscope, 
  ClipboardCheck, 
  User, 
  Mail, 
  Lock, 
  HeartHandshake, 
  AlertCircle, 
  Building2, 
  Award, 
  Briefcase, 
  IndianRupee,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const DEPARTMENTS = [
  'General Medicine',
  'Cardiology',
  'Orthopedics',
  'Pediatrics',
  'Dermatology',
  'ENT',
  'Neurology',
  'Gynecology',
  'Ophthalmology',
  'Dentistry'
];

export const Register = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = ['patient', 'doctor', 'receptionist'].includes(searchParams.get('role'))
    ? searchParams.get('role')
    : 'patient';

  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    isSeniorCitizen: false,
    department: 'General Medicine',
    specialization: '',
    qualification: 'MBBS, MD',
    consultationFee: 500
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Keep search param synced if role changes
  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam && ['patient', 'doctor', 'receptionist'].includes(roleParam)) {
      setSelectedRole(roleParam);
    }
  }, [searchParams]);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setSearchParams({ role });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please include a valid email address with a domain extension (e.g. name@gmail.com)');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    // Format phone with Indian country code (+91) if not already formatted
    let formattedPhone = formData.phone.trim();
    if (formattedPhone) {
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = formattedPhone.startsWith('91') 
          ? `+${formattedPhone}` 
          : `+91 ${formattedPhone}`;
      }
    }

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      phone: formattedPhone,
      role: selectedRole,
      isSeniorCitizen: selectedRole === 'patient' ? Boolean(formData.isSeniorCitizen) : false,
      ...(selectedRole === 'doctor' && {
        department: formData.department,
        specialization: formData.specialization.trim() || `${formData.department} Specialist`,
        qualification: formData.qualification.trim() || 'MBBS, MD',
        consultationFee: Number(formData.consultationFee) || 500
      })
    };

    try {
      await api.post('/auth/register', payload);

      // Redirect user to the login page first with a success notification
      const roleDisplayName = 
        selectedRole === 'doctor' ? 'Doctor' : 
        selectedRole === 'receptionist' ? 'Receptionist' : 'Patient';

      navigate('/login', {
        state: {
          successMessage: `${roleDisplayName} account registered successfully! Please sign in with your credentials to access your dashboard.`,
          prefillEmail: formData.email.trim().toLowerCase()
        }
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.errors && Array.isArray(err.response.data.errors)
          ? err.response.data.errors.map((e) => e.message).join('. ')
          : err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 w-full max-w-lg space-y-6 shadow-xl shadow-slate-200/50">
        
        {/* Role Selector Tabs */}
        <div>
          <label className="block text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            Select Registration Type
          </label>
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleRoleSelect('patient')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'patient'
                  ? 'bg-white text-slate-900 shadow-sm border border-[#F6B2B2]/60 ring-2 ring-[#F6B2B2]/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <User className={`w-4 h-4 ${selectedRole === 'patient' ? 'text-[#D87070]' : 'text-slate-400'}`} />
              <span>Patient</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('doctor')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'doctor'
                  ? 'bg-white text-slate-900 shadow-sm border border-[#F6B2B2]/60 ring-2 ring-[#F6B2B2]/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Stethoscope className={`w-4 h-4 ${selectedRole === 'doctor' ? 'text-[#D87070]' : 'text-slate-400'}`} />
              <span>Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('receptionist')}
              className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'receptionist'
                  ? 'bg-white text-slate-900 shadow-sm border border-[#F6B2B2]/60 ring-2 ring-[#F6B2B2]/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <ClipboardCheck className={`w-4 h-4 ${selectedRole === 'receptionist' ? 'text-[#D87070]' : 'text-slate-400'}`} />
              <span>Receptionist</span>
            </button>
          </div>
        </div>

        {/* Dynamic Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF0F2] border border-[#F6B2B2]/40 text-[#D87070] flex items-center justify-center mx-auto shadow-sm">
            {selectedRole === 'patient' && <UserPlus className="w-6 h-6" />}
            {selectedRole === 'doctor' && <Stethoscope className="w-6 h-6" />}
            {selectedRole === 'receptionist' && <ClipboardCheck className="w-6 h-6" />}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            {selectedRole === 'patient' && 'Patient Registration'}
            {selectedRole === 'doctor' && 'Doctor Registration'}
            {selectedRole === 'receptionist' && 'Receptionist Registration'}
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            {selectedRole === 'patient' && 'Join CareQueue for online slot booking and live position tracking'}
            {selectedRole === 'doctor' && 'Register your clinical profile to manage live queues and appointment slots'}
            {selectedRole === 'receptionist' && 'Register front desk credentials to manage patient arrivals and tokens'}
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              {selectedRole === 'doctor' ? "Doctor's Full Name" : selectedRole === 'receptionist' ? "Staff Full Name" : "Full Name"}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={
                  selectedRole === 'doctor' 
                    ? 'Dr. Ananya Sharma' 
                    : selectedRole === 'receptionist' 
                    ? 'Sarah Receptionist' 
                    : 'Aman Gupta'
                }
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={
                  selectedRole === 'doctor' 
                    ? 'doctor@hospital.com' 
                    : selectedRole === 'receptionist' 
                    ? 'reception@hospital.com' 
                    : 'name@example.com'
                }
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Must include @ and a valid domain (e.g. .com, .in)</p>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number (+91)
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 top-2.5 flex items-center gap-1.5 text-slate-600 text-xs font-bold border-r border-slate-200 pr-2.5 select-none">
                <span>🇮🇳</span>
                <span>+91</span>
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="98765 43210"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl pl-20 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Doctor-Specific Fields */}
          {selectedRole === 'doctor' && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all appearance-none cursor-pointer"
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Specialization
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      placeholder="e.g. Family Medicine"
                      className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Qualification
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      placeholder="MBBS, MD"
                      className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Consultation Fee (₹)
                  </label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="number"
                      name="consultationFee"
                      min={0}
                      step={50}
                      value={formData.consultationFee}
                      onChange={handleChange}
                      placeholder="500"
                      className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Automatic Schedule Setup:</strong> Registering as a doctor will automatically generate 14 days of appointment booking slots (09:00 - 17:00) so patients can book immediately.
                </span>
              </div>
            </div>
          )}

          {/* Receptionist Notice */}
          {selectedRole === 'receptionist' && (
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Front Desk Authorization:</strong> You will gain staff privileges to check in scheduled patients, create instant walk-in tokens, and manage doctor waiting rooms.
              </span>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Patient Senior Citizen Checkbox */}
          {selectedRole === 'patient' && (
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center space-x-3">
              <input
                type="checkbox"
                id="isSeniorCitizen"
                name="isSeniorCitizen"
                checked={formData.isSeniorCitizen}
                onChange={handleChange}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
              />
              <label htmlFor="isSeniorCitizen" className="text-xs font-semibold text-amber-900 cursor-pointer flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                Senior Citizen Priority (60+ years old)
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
          >
            {loading ? (
              'Creating Account...'
            ) : (
              <>
                <span>
                  {selectedRole === 'doctor' && 'Register as Doctor'}
                  {selectedRole === 'receptionist' && 'Register as Receptionist'}
                  {selectedRole === 'patient' && 'Register as Patient'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          Already have an account?{' '}
          <Link to="/login" className="text-[#D87070] font-bold hover:underline">
            Sign In to CareQueue
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
