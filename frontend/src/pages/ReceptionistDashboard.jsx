import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import { formatDoctorName } from '../utils/formatters';
import LiveQueueList from '../components/queue/LiveQueueList';
import { UserPlus, CheckSquare, Search, AlertTriangle, HeartHandshake, Stethoscope, CheckCircle2, AlertCircle } from 'lucide-react';

export const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const { socket, joinReceptionRoom } = useSocket();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [liveQueue, setLiveQueue] = useState([]);

  // Walk-in form state
  const [walkInForm, setWalkInForm] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    isSeniorCitizen: false,
    doctorId: '',
    isEmergency: false,
    reasonForVisit: 'Walk-In Consultation'
  });

  // Check-in lookup state
  const [searchQuery, setSearchQuery] = useState('');
  const [todayAppointments, setTodayAppointments] = useState([]);

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
    joinReceptionRoom();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      fetchDoctorQueue(selectedDoctorId);
    }
  }, [selectedDoctorId]);

  // Socket listener for live queue updates
  useEffect(() => {
    if (!socket) return;

    socket.on('queue:update', (data) => {
      if (data.doctorId === selectedDoctorId) {
        fetchDoctorQueue(selectedDoctorId);
      }
    });

    return () => {
      socket.off('queue:update');
    };
  }, [socket, selectedDoctorId]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data);
      if (res.data.length > 0) {
        setSelectedDoctorId(res.data[0]._id);
        setWalkInForm(prev => ({ ...prev, doctorId: res.data[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const fetchDoctorQueue = async (docId) => {
    try {
      const res = await api.get(`/queue/${docId}`);
      setLiveQueue(res.data.queue || []);
    } catch (err) {
      console.error('Error fetching queue:', err);
    }
  };

  const handleWalkInSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Format phone with Indian country code (+91)
    let formattedPhone = walkInForm.patientPhone.trim();
    if (formattedPhone && !formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.startsWith('91') ? `+${formattedPhone}` : `+91 ${formattedPhone}`;
    }

    try {
      const res = await api.post('/queue/walk-in', {
        ...walkInForm,
        patientPhone: formattedPhone
      });
      setMessage({
        type: 'success',
        text: `Walk-in registered for ${walkInForm.patientName}! Position #${res.data.position} in queue.`
      });

      // Reset form
      setWalkInForm({
        patientName: '',
        patientPhone: '',
        patientEmail: '',
        isSeniorCitizen: false,
        doctorId: selectedDoctorId,
        isEmergency: false,
        reasonForVisit: 'Walk-In Consultation'
      });

      fetchDoctorQueue(selectedDoctorId);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to add walk-in patient.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyToggle = async (doctorId, appointmentId, isEmergency) => {
    try {
      await api.put(`/queue/${doctorId}/emergency/${appointmentId}`, { isEmergency });
      fetchDoctorQueue(doctorId);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update emergency status.' });
    }
  };

  const handleNoShow = async (doctorId, appointmentId) => {
    try {
      await api.put(`/queue/${doctorId}/no-show/${appointmentId}`);
      fetchDoctorQueue(doctorId);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to mark no-show.' });
    }
  };

  return (
    <div className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 rounded-3xl">
        <span className="text-xs font-bold text-[#D87070] uppercase tracking-wider">Hospital Front Desk</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">Receptionist Control Desk</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Register walk-in patients, manage arrivals, and coordinate emergency priority triage in real-time.
        </p>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Walk-In Registration Form */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 rounded-3xl space-y-5">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#FDF0F2] border border-[#F6B2B2]/40 text-[#D87070] flex items-center justify-center shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Register Walk-In Patient</h3>
                <p className="text-xs text-slate-500">Add directly to live triage queue</p>
              </div>
            </div>

            <form onSubmit={handleWalkInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Patient Name *
                </label>
                <input
                  type="text"
                  required
                  value={walkInForm.patientName}
                  onChange={(e) => setWalkInForm({ ...walkInForm, patientName: e.target.value })}
                  placeholder="Patient Full Name"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number (+91)
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 top-2.5 flex items-center gap-1.5 text-slate-600 text-xs font-bold border-r border-slate-200 pr-2.5 select-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={walkInForm.patientPhone}
                    onChange={(e) => setWalkInForm({ ...walkInForm, patientPhone: e.target.value })}
                    placeholder="98765 43210"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl pl-20 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Doctor *
                </label>
                <select
                  value={walkInForm.doctorId}
                  onChange={(e) => {
                    setWalkInForm({ ...walkInForm, doctorId: e.target.value });
                    setSelectedDoctorId(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all"
                >
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>
                      {formatDoctorName(d.user?.name)} ({d.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Emergency & Senior Toggles */}
              <div className="space-y-2.5 pt-1">
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-3 transition-colors">
                  <input
                    type="checkbox"
                    id="isEmergency"
                    checked={walkInForm.isEmergency}
                    onChange={(e) => setWalkInForm({ ...walkInForm, isEmergency: e.target.checked })}
                    className="w-4 h-4 text-rose-600 focus:ring-rose-500 rounded border-rose-300"
                  />
                  <label htmlFor="isEmergency" className="text-xs font-bold text-rose-800 cursor-pointer flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    EMERGENCY BUMP (Highest Priority)
                  </label>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-3 transition-colors">
                  <input
                    type="checkbox"
                    id="isSenior"
                    checked={walkInForm.isSeniorCitizen}
                    onChange={(e) => setWalkInForm({ ...walkInForm, isSeniorCitizen: e.target.checked })}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded border-amber-300"
                  />
                  <label htmlFor="isSenior" className="text-xs font-bold text-amber-900 cursor-pointer flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
                    Senior Citizen (60+ yrs)
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 font-bold py-3.5 rounded-xl shadow-md text-sm transition-all transform hover:-translate-y-0.5"
              >
                {loading ? 'Processing...' : 'Add Walk-In to Priority Queue'}
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Cols: Live Multi-Doctor Queue Monitor */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 rounded-3xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#FDF0F2] border border-[#F6B2B2]/40 text-[#D87070] flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Live Doctor Queue Monitor</h3>
                  <p className="text-xs text-slate-500">Real-time min-heap triage sequence</p>
                </div>
              </div>

              <div className="w-full sm:w-auto">
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#F6B2B2]"
                >
                  {doctors.map(d => (
                    <option key={d._id} value={d._id}>
                      {formatDoctorName(d.user?.name)} ({d.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <LiveQueueList
              queue={liveQueue}
              onEmergencyToggle={handleEmergencyToggle}
              onNoShow={handleNoShow}
              canManage={true}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ReceptionistDashboard;
