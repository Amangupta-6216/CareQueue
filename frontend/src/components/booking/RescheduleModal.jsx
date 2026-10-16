import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDoctorName } from '../../utils/formatters';
import SlotPicker from './SlotPicker';
import { Calendar, Clock, X, AlertCircle } from 'lucide-react';

export const RescheduleModal = ({ appointment, isOpen, onClose, onRescheduleSuccess }) => {
  if (!isOpen || !appointment) return null;

  const [selectedDate, setSelectedDate] = useState(appointment.date || new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isOnLeave, setIsOnLeave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const doctorId = appointment.doctor?._id || appointment.doctor;
  const doctorName = appointment.doctor?.user?.name || 'Doctor';

  useEffect(() => {
    if (doctorId && selectedDate) {
      fetchSlots(doctorId, selectedDate);
    }
  }, [doctorId, selectedDate]);

  const fetchSlots = async (docId, dateStr) => {
    try {
      const res = await api.get(`/doctors/${docId}/slots?date=${dateStr}`);
      setSlots(res.data.slots || []);
      setIsOnLeave(Boolean(res.data.onLeave));
      setSelectedSlot(null);
    } catch (err) {
      console.error('Failed to fetch slots for reschedule:', err);
      setSlots([]);
      setIsOnLeave(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    setError('');

    try {
      await api.put(`/appointments/${appointment._id}/reschedule`, {
        newSlotId: selectedSlot._id,
        newDate: selectedDate,
        newStartTime: selectedSlot.startTime
      });

      onRescheduleSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Reschedule failed. Please try another slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 max-w-lg w-full space-y-5 relative shadow-2xl text-slate-900">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Reschedule Appointment</h3>
            <p className="text-xs text-[#D87070] font-medium">{formatDoctorName(doctorName)}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <SlotPicker
          slots={slots}
          selectedSlot={selectedSlot}
          onSelectSlot={setSelectedSlot}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          isOnLeave={isOnLeave}
        />

        <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReschedule}
            disabled={!selectedSlot || loading || isOnLeave}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
              selectedSlot && !loading && !isOnLeave
                ? 'bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
