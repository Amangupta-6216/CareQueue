import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import NextPatientCard from '../components/queue/NextPatientCard';
import LiveQueueList from '../components/queue/LiveQueueList';
import BookedAppointmentsSection from '../components/doctor/BookedAppointmentsSection';
import { formatDoctorName } from '../utils/formatters';
import { Stethoscope, Users, CheckCircle2, Clock, Calendar, AlertCircle, PlaneTakeoff, CalendarDays } from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const { socket, joinDoctorRoom } = useSocket();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [doctorInfo, setDoctorInfo] = useState(null);
  const [queue, setQueue] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('both'); // 'both' | 'appointments' | 'queue'
  const [inProgressPatient, setInProgressPatient] = useState(null);
  const [stats, setStats] = useState({ seenToday: 0, waiting: 0 });
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDate, setLeaveDate] = useState(todayStr);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  // Fetch doctor record on mount
  useEffect(() => {
    fetchDoctorProfile();
  }, [user]);

  useEffect(() => {
    if (doctorInfo) {
      fetchLiveQueue(doctorInfo._id, selectedDate);
      joinDoctorRoom(doctorInfo._id);
    }
  }, [doctorInfo]);

  // Socket listener for live queue & appointment updates
  useEffect(() => {
    if (!socket) return;

    const handleQueueUpdate = (data) => {
      if (doctorInfo && data.doctorId === doctorInfo._id) {
        if (typeof data.seenToday === 'number' && selectedDate === todayStr) {
          setStats((prev) => ({
            ...prev,
            seenToday: data.seenToday,
            waiting: Array.isArray(data.queue) ? data.queue.length : prev.waiting
          }));
        }
        fetchLiveQueue(doctorInfo._id, selectedDate);
      }
    };

    const handleNextPatientSocket = () => {
      if (doctorInfo) fetchLiveQueue(doctorInfo._id, selectedDate);
    };

    const handleAppointmentSocket = (data) => {
      if (!doctorInfo) return;
      if (!data || !data.doctorId || data.doctorId === doctorInfo._id) {
        fetchLiveQueue(doctorInfo._id, selectedDate);
      }
    };

    socket.on('queue:update', handleQueueUpdate);
    socket.on('doctor:nextPatient', handleNextPatientSocket);
    socket.on('slot:update', handleAppointmentSocket);
    socket.on('appointment:booked', handleAppointmentSocket);
    socket.on('doctor:appointmentBooked', handleAppointmentSocket);

    return () => {
      socket.off('queue:update', handleQueueUpdate);
      socket.off('doctor:nextPatient', handleNextPatientSocket);
      socket.off('slot:update', handleAppointmentSocket);
      socket.off('appointment:booked', handleAppointmentSocket);
      socket.off('doctor:appointmentBooked', handleAppointmentSocket);
    };
  }, [socket, doctorInfo, selectedDate]);

  const fetchDoctorProfile = async () => {
    try {
      const res = await api.get('/doctors');
      const myDoc = res.data.find(d => d.user?._id === user?._id);
      if (myDoc) {
        setDoctorInfo(myDoc);
      }
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveQueue = async (docId, dateToFetch = selectedDate) => {
    try {
      const res = await api.get(`/queue/${docId}?date=${dateToFetch}`);
      setQueue(res.data.queue || []);
      setInProgressPatient(res.data.inProgressPatient || null);
      setAppointments(res.data.appointments || []);
      setStats({
        waiting: res.data.count || 0,
        seenToday: typeof res.data.seenToday === 'number' ? res.data.seenToday : 0
      });
    } catch (err) {
      console.error('Error fetching doctor queue:', err);
    }
  };

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    if (doctorInfo) {
      fetchLiveQueue(doctorInfo._id, newDate);
    }
  };

  const handleCallNext = async () => {
    if (!doctorInfo) return;
    try {
      const res = await api.put(`/queue/${doctorInfo._id}/next`);
      setMessage({ type: 'success', text: res.data.message });
      if (typeof res.data.seenToday === 'number') {
        setStats(prev => ({ ...prev, seenToday: res.data.seenToday }));
      }
      fetchLiveQueue(doctorInfo._id, selectedDate);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error calling next patient.' });
    }
  };

  const handleMarkDone = async () => {
    if (!doctorInfo || !inProgressPatient) return;
    try {
      const aptId = inProgressPatient.appointmentId?._id || inProgressPatient.appointmentId;
      const res = await api.put(`/queue/${doctorInfo._id}/done/${aptId || ''}`);
      if (typeof res.data.seenToday === 'number') {
        setStats(prev => ({ ...prev, seenToday: res.data.seenToday }));
      } else {
        setStats(prev => ({ ...prev, seenToday: prev.seenToday + 1 }));
      }
      setMessage({ type: 'success', text: res.data?.message || 'Consultation completed successfully!' });
      fetchLiveQueue(doctorInfo._id, selectedDate);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error marking consultation as done.' });
    }
  };

  const handleNoShow = async (appointmentId) => {
    if (!doctorInfo) return;
    const aptId = (typeof appointmentId === 'object' ? appointmentId?._id : appointmentId) || inProgressPatient?.appointmentId?._id || inProgressPatient?.appointmentId;
    try {
      const res = await api.put(`/queue/${doctorInfo._id}/no-show/${aptId || ''}`);
      setMessage({ type: 'success', text: 'Patient marked as No-Show.' });
      if (typeof res.data.seenToday === 'number') {
        setStats(prev => ({ ...prev, seenToday: res.data.seenToday }));
      }
      fetchLiveQueue(doctorInfo._id, selectedDate);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error marking no-show.' });
    }
  };

  const handleLeaveRequest = async (e) => {
    e.preventDefault();
    if (!doctorInfo) return;
    try {
      const res = await api.post(`/doctors/${doctorInfo._id}/leave-request`, {
        date: leaveDate,
        reason: leaveReason
      });
      setMessage({ type: 'success', text: 'Leave request submitted for admin approval.' });
      setLeaveReason('');
      if (res.data.doctor) {
        setDoctorInfo(res.data.doctor);
      } else {
        fetchDoctorProfile();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to submit leave request.' });
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
      <div className="bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#D87070] uppercase tracking-wider">Doctor Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">Welcome, {formatDoctorName(user?.name)}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Department: <span className="text-[#D87070] font-semibold">{doctorInfo?.department || 'General Medicine'}</span>
          </p>
        </div>

        {/* Stats Pills & Date Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-2xl text-xs text-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-[#D87070]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer text-xs"
              title="Select specific date to inspect consultations & booked appointments"
            />
          </div>

          <div className="bg-slate-50 border border-slate-200 shadow-sm px-5 py-2.5 rounded-2xl text-center">
            <span className="block text-2xl font-black text-indigo-600">{appointments.length}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Booked On Date</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 shadow-sm px-5 py-2.5 rounded-2xl text-center">
            <span className="block text-2xl font-black text-slate-900">{queue.length}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Waiting</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 shadow-sm px-5 py-2.5 rounded-2xl text-center">
            <span className="block text-2xl font-black text-emerald-600">{stats.seenToday}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {selectedDate === todayStr ? 'Seen Today' : 'Seen On Date'}
            </span>
          </div>
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

      {/* Hero Active Room Card */}
      <NextPatientCard
        inProgressPatient={inProgressPatient}
        nextInQueue={queue[0] || null}
        onCallNext={handleCallNext}
        onMarkDone={handleMarkDone}
        onNoShow={handleNoShow}
      />

      {/* View Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 text-xs font-bold shadow-xs">
          <button
            onClick={() => setActiveTab('both')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'both'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Overview
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'appointments'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-[#D87070]" />
            Booked Schedule ({appointments.length})
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'queue'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#D87070]" />
            Live Queue ({queue.length})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing schedule & queue for: <span className="font-bold text-slate-800">{selectedDate}</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Booked Appointments Schedule & Live MinHeap Queue */}
        <div className="lg:col-span-2 space-y-8">
          {/* Booked Appointments for Selected Date */}
          {(activeTab === 'both' || activeTab === 'appointments') && (
            <BookedAppointmentsSection
              appointments={appointments}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              doctorName={user?.name}
            />
          )}

          {/* Live Waiting Queue (Priority Triage Order) */}
          {(activeTab === 'both' || activeTab === 'queue') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#D87070]" />
                  Live Waiting Queue
                </h3>
                <span className="text-xs font-semibold text-slate-500">{queue.length} Patients Waiting</span>
              </div>

              <LiveQueueList
                queue={queue}
                onNoShow={handleNoShow}
                canManage={true}
              />
            </div>
          )}
        </div>

        {/* Right Col: Date Quick Switcher & Leave Request */}
        <div className="space-y-6">
          {/* Date Quick Switcher Card */}
          <div className="bg-white border border-slate-200/90 shadow-sm p-5 rounded-3xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D87070]" />
                Date Quick Switcher
              </span>
              <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                {appointments.length} Booked
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleDateChange(todayStr)}
                className={`py-2 px-3 rounded-xl border transition-all ${
                  selectedDate === todayStr
                    ? 'bg-[#FDF0F2] border-[#F6B2B2] text-[#D87070] shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  handleDateChange(d.toISOString().split('T')[0]);
                }}
                className="py-2 px-3 rounded-xl border bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 transition-all"
              >
                Tomorrow
              </button>
            </div>
          </div>
          <div className="bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 rounded-3xl space-y-5">
            <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                <PlaneTakeoff className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Leave / Schedule Off</h3>
                <p className="text-xs text-slate-500">Block slot bookings for selected dates</p>
              </div>
            </div>
            
            <form onSubmit={handleLeaveRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Leave Date
                </label>
                <input
                  type="date"
                  required
                  value={leaveDate}
                  onChange={(e) => setLeaveDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Leave
                </label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="e.g. Medical conference, personal emergency..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 font-bold py-3 rounded-xl shadow-md text-xs transition-all transform hover:-translate-y-0.5"
              >
                Submit Leave Request
              </button>
            </form>

            {/* List of Doctor's Submitted Leave Requests */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">My Submitted Leave Requests</h4>
              {!doctorInfo?.leaveRequests || doctorInfo.leaveRequests.length === 0 ? (
                <p className="text-xs text-slate-400">No leave requests submitted yet.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {doctorInfo.leaveRequests.map((req, idx) => (
                    <div key={req._id || idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{req.date}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{req.reason}</div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        req.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
