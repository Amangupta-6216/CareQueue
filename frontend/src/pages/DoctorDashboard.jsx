import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import NextPatientCard from '../components/queue/NextPatientCard';
import LiveQueueList from '../components/queue/LiveQueueList';
import { formatDoctorName } from '../utils/formatters';
import { Stethoscope, Users, CheckCircle2, Clock, Calendar, AlertCircle, PlaneTakeoff } from 'lucide-react';

export const DoctorDashboard = () => {
  const { user } = useAuth();
  const { socket, joinDoctorRoom } = useSocket();

  const [doctorInfo, setDoctorInfo] = useState(null);
  const [queue, setQueue] = useState([]);
  const [inProgressPatient, setInProgressPatient] = useState(null);
  const [stats, setStats] = useState({ seenToday: 0, waiting: 0 });
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split('T')[0]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);

  // Fetch doctor record & queue on mount
  useEffect(() => {
    fetchDoctorProfile();
  }, [user]);

  useEffect(() => {
    if (doctorInfo) {
      fetchLiveQueue(doctorInfo._id);
      joinDoctorRoom(doctorInfo._id);
    }
  }, [doctorInfo]);

  // Socket listener for live queue updates
  useEffect(() => {
    if (!socket) return;

    socket.on('queue:update', (data) => {
      if (doctorInfo && data.doctorId === doctorInfo._id) {
        fetchLiveQueue(doctorInfo._id);
      }
    });

    socket.on('doctor:nextPatient', () => {
      if (doctorInfo) fetchLiveQueue(doctorInfo._id);
    });

    return () => {
      socket.off('queue:update');
      socket.off('doctor:nextPatient');
    };
  }, [socket, doctorInfo]);

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

  const fetchLiveQueue = async (docId) => {
    try {
      const res = await api.get(`/queue/${docId}`);
      setQueue(res.data.queue || []);
      setInProgressPatient(res.data.inProgressPatient || null);
      setStats({
        waiting: res.data.count || 0,
        seenToday: stats.seenToday
      });
    } catch (err) {
      console.error('Error fetching doctor queue:', err);
    }
  };

  const handleCallNext = async () => {
    if (!doctorInfo) return;
    try {
      const res = await api.post(`/queue/${doctorInfo._id}/next`);
      setMessage({ type: 'success', text: res.data.message });
      fetchLiveQueue(doctorInfo._id);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error calling next patient.' });
    }
  };

  const handleMarkDone = async () => {
    if (!doctorInfo || !inProgressPatient) return;
    try {
      await api.put(`/queue/${doctorInfo._id}/done/${inProgressPatient.appointmentId}`);
      setStats(prev => ({ ...prev, seenToday: prev.seenToday + 1 }));
      setMessage({ type: 'success', text: 'Consultation completed successfully!' });
      fetchLiveQueue(doctorInfo._id);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error marking consultation as done.' });
    }
  };

  const handleNoShow = async (appointmentId) => {
    if (!doctorInfo || !appointmentId) return;
    try {
      await api.put(`/queue/${doctorInfo._id}/no-show/${appointmentId}`);
      setMessage({ type: 'success', text: 'Patient marked as No-Show.' });
      fetchLiveQueue(doctorInfo._id);
    } catch (err) {
      setMessage({ type: 'error', text: 'Error marking no-show.' });
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

        {/* Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 shadow-sm px-5 py-2.5 rounded-2xl text-center">
            <span className="block text-2xl font-black text-slate-900">{queue.length}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Waiting</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 shadow-sm px-5 py-2.5 rounded-2xl text-center">
            <span className="block text-2xl font-black text-emerald-600">{stats.seenToday}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Seen Today</span>
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Live MinHeap Priority Queue */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#D87070]" />
              Live Waiting Queue (Priority Triage Order)
            </h3>
            <span className="text-xs font-semibold text-slate-500">{queue.length} Patients Waiting</span>
          </div>

          <LiveQueueList
            queue={queue}
            onNoShow={handleNoShow}
            canManage={true}
          />
        </div>

        {/* Right Col: Leave Request & Availability Panel */}
        <div className="space-y-6">
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
