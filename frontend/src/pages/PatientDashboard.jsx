import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import api from '../services/api';
import DoctorCard from '../components/booking/DoctorCard';
import SlotPicker from '../components/booking/SlotPicker';
import DoctorProfileModal from '../components/booking/DoctorProfileModal';
import BookingConfirmationModal from '../components/booking/BookingConfirmationModal';
import RescheduleModal from '../components/booking/RescheduleModal';
import { formatDoctorName } from '../utils/formatters';
import { Calendar, Clock, Stethoscope, CheckCircle2, AlertCircle, Activity, UserCheck, RefreshCw, XCircle } from 'lucide-react';

export const PatientDashboard = () => {
  const { user } = useAuth();
  const { socket, joinPatientRoom } = useSocket();

  const [doctors, setDoctors] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [reasonForVisit, setReasonForVisit] = useState('');

  // Modals state
  const [profileDoctor, setProfileDoctor] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [rescheduleApt, setRescheduleApt] = useState(null);

  const departments = ['All', 'General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'ENT'];

  useEffect(() => {
    fetchDoctors();
    fetchMyAppointments();
    if (user) {
      joinPatientRoom(user._id);
    }
  }, [selectedDept, user]);

  // Socket listener for live status and slot availability updates
  useEffect(() => {
    if (!socket) return;

    socket.on('appointment:statusChange', () => {
      fetchMyAppointments();
    });

    const handleSlotUpdate = (data) => {
      if (selectedDoctor && data.doctorId === selectedDoctor._id && data.date === selectedDate) {
        setSlots(prevSlots => prevSlots.map(s => {
          if (s._id === data.slotId) {
            return {
              ...s,
              isBooked: data.isBooked,
              remainingCapacity: data.remainingCapacity !== undefined ? data.remainingCapacity : s.remainingCapacity
            };
          }
          return s;
        }));
      }
    };

    socket.on('queue:update', () => {
      fetchMyAppointments();
      if (selectedDoctor) fetchSlots(selectedDoctor._id, selectedDate);
    });

    socket.on('slot:update', handleSlotUpdate);

    return () => {
      socket.off('appointment:statusChange');
      socket.off('queue:update');
      socket.off('slot:update', handleSlotUpdate);
    };
  }, [socket, selectedDoctor, selectedDate]);

  useEffect(() => {
    if (selectedDoctor) {
      fetchSlots(selectedDoctor._id, selectedDate);
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get(`/doctors${selectedDept !== 'All' ? `?department=${selectedDept}` : ''}`);
      setDoctors(res.data);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const res = await api.get('/appointments/my');
      setAppointments(res.data);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (doctorId, dateStr) => {
    try {
      const res = await api.get(`/doctors/${doctorId}/slots?date=${dateStr}`);
      setSlots(res.data.slots || []);
      setIsOnLeave(Boolean(res.data.onLeave));
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      setSlots([]);
      setIsOnLeave(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedDoctor || !selectedSlot) return;

    setBookingLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/appointments/book', {
        doctorId: selectedDoctor._id,
        slotId: selectedSlot._id,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        reasonForVisit
      });

      setMessage({ type: 'success', text: '🎉 Appointment booked successfully!' });
      setSelectedSlot(null);
      setShowConfirmModal(false);
      setReasonForVisit('');
      fetchMyAppointments();
      fetchSlots(selectedDoctor._id, selectedDate);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Booking failed.' });
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCheckIn = async (aptId) => {
    try {
      const res = await api.put(`/appointments/${aptId}/check-in`);
      setMessage({ type: 'success', text: res.data.message });
      fetchMyAppointments();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Check-in failed.' });
    }
  };

  const handleCancel = async (aptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/appointments/${aptId}/cancel`);
      setMessage({ type: 'success', text: 'Appointment cancelled and slot freed.' });
      fetchMyAppointments();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cancellation failed.' });
    }
  };

  const activeAppointments = appointments.filter(a => ['booked', 'checked-in', 'in-queue', 'in-progress'].includes(a.status));
  const pastAppointments = appointments.filter(a => ['done', 'cancelled', 'no-show'].includes(a.status));

  return (
    <div className="space-y-8 py-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 shadow-sm p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#D87070] uppercase tracking-wider">Patient Workspace</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">Welcome, {user?.name}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {user?.isSeniorCitizen ? '⭐ Senior Citizen Priority Account Active' : 'Standard Patient Account'}
          </p>
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

      {/* FRONT-AND-CENTER: Active / Upcoming Appointment Hero Card */}
      {activeAppointments.length > 0 && (
        <div className="bg-white border border-[#F6B2B2]/60 shadow-md p-6 sm:p-8 rounded-3xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                Active & Upcoming Appointments (Live Real-Time Tracker)
              </h3>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">Auto-updating via Socket.io</span>
          </div>

          {/* Queue Priority Explanation for Patients */}
          <div className="p-3 bg-slate-50/90 rounded-2xl border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
            <Activity className="w-4 h-4 text-[#D87070] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Queue Order & Priority Policy</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Queue positions are prioritized strictly by clinical urgency level and arrival timestamp. Your position may dynamically adjust if authorized clinical staff reassess urgency.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAppointments.map(apt => {
              const pos = apt.queuePosition;
              const estWait = pos ? (pos - 1) * 15 : null;

              return (
                <div key={apt._id} className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl space-y-4 relative hover:border-slate-300 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-[#FDF0F2] border border-[#F6B2B2]/40 text-[#D87070] flex items-center justify-center shrink-0">
                        <UserCheck className="w-6 h-6 text-[#D87070]" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{formatDoctorName(apt.doctor?.user?.name)}</h4>
                        <p className="text-xs text-[#D87070] font-semibold">{apt.doctor?.department}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      apt.status === 'in-queue' ? 'bg-[#FDF0F2] text-[#B55050] border border-[#F6B2B2]' :
                      apt.status === 'in-progress' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {apt.status === 'in-queue' ? `In Queue (#${pos || 1})` : apt.status}
                    </span>
                  </div>

                  {/* Date & Live Queue Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Slot Time</span>
                      <span className="text-slate-900 font-semibold">{apt.date} @ {apt.startTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold">Estimated Wait</span>
                      <span className="text-[#D87070] font-bold">{estWait !== null ? `~${estWait} mins` : 'Check in to see wait'}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Subject to urgent triage</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                    {apt.status === 'booked' && (
                      <button
                        onClick={() => handleCheckIn(apt._id)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Join Queue / Check-In
                      </button>
                    )}

                    <button
                      onClick={() => setRescheduleApt(apt)}
                      className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      Reschedule
                    </button>

                    <button
                      onClick={() => handleCancel(apt._id)}
                      className="px-3.5 py-2.5 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:border-rose-200 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Booking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Doctor Browser */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Find & Book Doctor</h2>
              <p className="text-xs text-slate-500">Filter by clinical specialty and select your practitioner</p>
            </div>
            
            {/* Department Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedDept === dept
                      ? 'bg-[#F6B2B2] text-slate-900 font-bold shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {doctors.map(doc => (
              <DoctorCard
                key={doc._id}
                doctor={doc}
                isSelected={selectedDoctor?._id === doc._id}
                onSelect={(d) => {
                  setSelectedDoctor(d);
                  setSelectedSlot(null);
                }}
                onViewProfile={(d) => setProfileDoctor(d)}
              />
            ))}
          </div>
        </div>

        {/* Right Col: Slot Picker & Booking Form */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 rounded-3xl space-y-5">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              {selectedDoctor ? `Book with ${formatDoctorName(selectedDoctor.user?.name)}` : 'Select a Doctor to View Slots'}
            </h3>

            {selectedDoctor ? (
              <>
                <SlotPicker
                  slots={slots}
                  selectedSlot={selectedSlot}
                  onSelectSlot={setSelectedSlot}
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  isOnLeave={isOnLeave}
                />

                {!isOnLeave && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Reason for Visit
                    </label>
                    <input
                      type="text"
                      value={reasonForVisit}
                      onChange={(e) => setReasonForVisit(e.target.value)}
                      placeholder="e.g. General checkup, Fever, Consultation"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all placeholder:text-slate-400"
                    />
                  </div>
                )}

                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={!selectedSlot || bookingLoading || isOnLeave}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 ${
                    selectedSlot && !bookingLoading && !isOnLeave
                      ? 'bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  {isOnLeave ? 'Doctor On Leave (Booking Blocked)' : 'Review & Confirm Booking'}
                </button>
              </>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                Select any doctor on the left to browse available date slots.
              </div>
            )}
          </div>

          {/* Past Appointment History */}
          {pastAppointments.length > 0 && (
            <div className="bg-white border border-slate-200/90 shadow-sm p-6 sm:p-7 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Past Appointment History</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {pastAppointments.map(apt => (
                  <div key={apt._id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{formatDoctorName(apt.doctor?.user?.name)}</div>
                      <div className="text-slate-500 mt-0.5">{apt.date} • {apt.startTime}</div>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      apt.status === 'done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      apt.status === 'no-show' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Doctor Full Profile Modal */}
      <DoctorProfileModal
        doctor={profileDoctor}
        isOpen={Boolean(profileDoctor)}
        onClose={() => setProfileDoctor(null)}
        onSelectForBooking={(doc) => {
          setSelectedDoctor(doc);
          setSelectedSlot(null);
        }}
      />

      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        doctor={selectedDoctor}
        slot={selectedSlot}
        date={selectedDate}
        isSeniorCitizen={user?.isSeniorCitizen}
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmBooking}
        loading={bookingLoading}
      />

      {/* Reschedule Modal */}
      <RescheduleModal
        appointment={rescheduleApt}
        isOpen={Boolean(rescheduleApt)}
        onClose={() => setRescheduleApt(null)}
        onRescheduleSuccess={() => {
          setMessage({ type: 'success', text: 'Appointment rescheduled successfully!' });
          fetchMyAppointments();
        }}
      />
    </div>
  );
};

export default PatientDashboard;
