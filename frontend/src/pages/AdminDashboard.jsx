import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { formatDoctorName } from '../utils/formatters';
import { Users, UserCheck, Stethoscope, Activity, TrendingUp, AlertTriangle, ShieldCheck, Plus, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [usersList, setUsersList] = useState([]);
  
  // Forms state
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showRecepModal, setShowRecepModal] = useState(false);

  const [docForm, setDocForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'General Medicine',
    specialization: '',
    consultationFee: 500
  });

  const [recepForm, setRecepForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  const departments = ['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, docsRes, usersRes] = await Promise.all([
        api.get('/admin/reports/summary'),
        api.get('/doctors'),
        api.get('/admin/users')
      ]);

      setReports(reportsRes.data);
      setDoctors(docsRes.data);
      setUsersList(usersRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    let formattedPhone = docForm.phone.trim();
    if (formattedPhone && !formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.startsWith('91') ? `+${formattedPhone}` : `+91 ${formattedPhone}`;
    }

    try {
      await api.post('/admin/doctors', {
        ...docForm,
        phone: formattedPhone
      });
      setMessage({ type: 'success', text: `Doctor ${docForm.name} onboarded successfully!` });
      setShowDoctorModal(false);
      setDocForm({
        name: '', email: '', password: '', phone: '',
        department: 'General Medicine', specialization: '', consultationFee: 500
      });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to onboard doctor' });
    }
  };

  const handleCreateRecep = async (e) => {
    e.preventDefault();
    let formattedPhone = recepForm.phone.trim();
    if (formattedPhone && !formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.startsWith('91') ? `+${formattedPhone}` : `+91 ${formattedPhone}`;
    }

    try {
      await api.post('/admin/receptionists', {
        ...recepForm,
        phone: formattedPhone
      });
      setMessage({ type: 'success', text: `Receptionist ${recepForm.name} account created!` });
      setShowRecepModal(false);
      setRecepForm({ name: '', email: '', password: '', phone: '' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create receptionist' });
    }
  };

  const handleToggleLeave = async (docId, currentStatus) => {
    try {
      await api.put(`/admin/doctors/${docId}/leave`, { onLeave: !currentStatus });
      setMessage({ type: 'success', text: 'Doctor leave status updated.' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update leave status' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#D87070]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#D87070] uppercase tracking-wider">Super Administrator</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">System Governance & Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Manage hospital staff, view real-time metrics, and coordinate queue operations.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowDoctorModal(true)}
            className="bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Onboard Doctor
          </button>
          <button
            onClick={() => setShowRecepModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Create Receptionist
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-sm ${
          message.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 shadow-sm p-5 sm:p-6 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Patients</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{reports?.totalPatients || 0}</div>
        </div>
        <div className="bg-white border border-slate-200/90 shadow-sm p-5 sm:p-6 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Doctors</span>
          <div className="text-2xl sm:text-3xl font-black text-[#D87070]">{reports?.totalDoctors || 0}</div>
        </div>
        <div className="bg-white border border-slate-200/90 shadow-sm p-5 sm:p-6 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Today's Appointments</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{reports?.totalAppointmentsToday || 0}</div>
        </div>
        <div className="bg-white border border-slate-200/90 shadow-sm p-5 sm:p-6 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">No-Show Rate</span>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">{reports?.noShowRate || '0%'}</div>
        </div>
      </div>

      {/* Doctors Roster Management Table */}
      <div className="bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 rounded-3xl space-y-5">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#FDF0F2] border border-[#F6B2B2]/40 text-[#D87070] flex items-center justify-center shrink-0">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Hospital Doctors Roster & Availability</h3>
            <p className="text-xs text-slate-500">Manage clinical departments and emergency leave states</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4 font-bold">Doctor Name</th>
                <th className="py-3 px-4 font-bold">Department</th>
                <th className="py-3 px-4 font-bold">Specialization</th>
                <th className="py-3 px-4 font-bold">Consultation Fee</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctors.map(doc => (
                <tr key={doc._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{formatDoctorName(doc.user?.name)}</td>
                  <td className="py-3 px-4 text-[#D87070] font-semibold">{doc.department}</td>
                  <td className="py-3 px-4 text-slate-500">{doc.specialization}</td>
                  <td className="py-3 px-4 text-emerald-600 font-semibold">${doc.consultationFee}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      doc.onLeave ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {doc.onLeave ? 'On Leave' : 'Active'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleLeave(doc._id, doc.onLeave)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        doc.onLeave
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {doc.onLeave ? 'Mark Available' : 'Put On Leave'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Approval Queue Panel */}
      <div className="bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 rounded-3xl space-y-5">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Doctor Leave Requests & Triage Approval</h3>
            <p className="text-xs text-slate-500">Approve or reject doctor schedule changes</p>
          </div>
        </div>

        {doctors.flatMap(d => d.leaveRequests || []).length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No pending or submitted leave requests at this time.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-bold">Doctor</th>
                  <th className="py-3 px-4 font-bold">Department</th>
                  <th className="py-3 px-4 font-bold">Requested Date</th>
                  <th className="py-3 px-4 font-bold">Reason</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 text-right font-bold">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.flatMap(d => (d.leaveRequests || []).map(lr => ({ ...lr, doctor: d }))).map(item => (
                  <tr key={item._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{formatDoctorName(item.doctor?.user?.name)}</td>
                    <td className="py-3 px-4 text-[#D87070] font-semibold">{item.doctor?.department}</td>
                    <td className="py-3 px-4 text-slate-900 font-medium">{item.date}</td>
                    <td className="py-3 px-4 text-slate-500">{item.reason}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        item.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {item.status === 'pending' ? (
                        <>
                          <button
                            onClick={async () => {
                              try {
                                await api.put(`/doctors/${item.doctor._id}/leave-request/${item._id}`, { status: 'approved' });
                                setMessage({ type: 'success', text: `Leave approved for ${formatDoctorName(item.doctor.user?.name)}` });
                                fetchData();
                              } catch (err) {
                                setMessage({ type: 'error', text: 'Failed to approve leave request' });
                              }
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await api.put(`/doctors/${item.doctor._id}/leave-request/${item._id}`, { status: 'rejected' });
                                setMessage({ type: 'success', text: `Leave rejected for ${formatDoctorName(item.doctor.user?.name)}` });
                                fetchData();
                              } catch (err) {
                                setMessage({ type: 'error', text: 'Failed to reject leave request' });
                              }
                            }}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-slate-400 text-[11px] font-semibold">Decided</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Onboard Doctor */}
      {showDoctorModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200/90 shadow-2xl p-6 sm:p-7 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Onboard New Doctor</h3>
            <form onSubmit={handleCreateDoctor} className="space-y-3">
              <input
                type="text" required placeholder="Doctor Name (e.g. Dr. Jane Smith)"
                value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white"
              />
              <input
                type="email" required placeholder="Doctor Email"
                value={docForm.email} onChange={e => setDocForm({...docForm, email: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white"
              />
              <div className="relative flex items-center">
                <div className="absolute left-3 top-2 flex items-center gap-1 text-slate-600 text-xs font-bold border-r border-slate-200 pr-2 select-none">
                  <span>🇮🇳 +91</span>
                </div>
                <input
                  type="tel" placeholder="Phone Number (e.g. 98765 43210)"
                  value={docForm.phone} onChange={e => setDocForm({...docForm, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-20 pr-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white"
                />
              </div>
              <input
                type="password" required placeholder="Account Password"
                value={docForm.password} onChange={e => setDocForm({...docForm, password: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white"
              />
              <select
                value={docForm.department} onChange={e => setDocForm({...docForm, department: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white"
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input
                type="text" placeholder="Specialization"
                value={docForm.specialization} onChange={e => setDocForm({...docForm, specialization: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white"
              />
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setShowDoctorModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 shadow-sm transition-all">Create Doctor Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Receptionist */}
      {showRecepModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200/90 shadow-2xl p-6 sm:p-7 rounded-3xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create Receptionist Account</h3>
            <form onSubmit={handleCreateRecep} className="space-y-3">
              <input
                type="text" required placeholder="Receptionist Full Name"
                value={recepForm.name} onChange={e => setRecepForm({...recepForm, name: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white"
              />
              <input
                type="email" required placeholder="Receptionist Email"
                value={recepForm.email} onChange={e => setRecepForm({...recepForm, email: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white"
              />
              <div className="relative flex items-center">
                <div className="absolute left-3 top-2 flex items-center gap-1 text-slate-600 text-xs font-bold border-r border-slate-200 pr-2 select-none">
                  <span>🇮🇳 +91</span>
                </div>
                <input
                  type="tel" placeholder="Phone Number (e.g. 98765 43210)"
                  value={recepForm.phone} onChange={e => setRecepForm({...recepForm, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-20 pr-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white"
                />
              </div>
              <input
                type="password" required placeholder="Account Password"
                value={recepForm.password} onChange={e => setRecepForm({...recepForm, password: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white"
              />
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setShowRecepModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 shadow-sm transition-all">Create Staff Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
