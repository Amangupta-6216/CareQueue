import React from 'react';
import { Calendar, Clock, DollarSign, UserCheck, HeartHandshake, CheckCircle2, X } from 'lucide-react';
// import { formatDoctorName } from '../../utils/formatters';

const formatDoctorName = (name) => {
  if (typeof name !== 'string' || !name.trim()) {
    return 'Dr. Specialist';
  }

  const clean = name.trim().replace(/^(dr\.?\s*)+/i, '').trim();
  return `Dr. ${clean || 'Specialist'}`;
};

export const BookingConfirmationModal = ({ doctor, slot, date, isSeniorCitizen, isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen || !doctor || !slot) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 max-w-md w-full space-y-6 relative shadow-2xl text-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Confirm Booking Details</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Details Box */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/70 space-y-3.5">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-[#FDF0F2] border border-[#F6B2B2]/50 text-[#D87070] flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">{formatDoctorName(doctor.user?.name)}</h4>
              <p className="text-xs text-[#D87070] font-semibold">{doctor.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-200/70">
            <div className="flex items-center space-x-1.5 text-slate-700">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{date}</span>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-700">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{slot.startTime} - {slot.endTime}</span>
            </div>
          </div>

          {isSeniorCitizen && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-800 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Senior Citizen Priority Enabled</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-200/70">
            <span className="text-slate-500">Total Consultation Fee:</span>
            <span className="text-base font-bold text-emerald-700">${doctor.consultationFee || 500}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 font-bold rounded-xl text-xs shadow-md transition-all transform hover:-translate-y-0.5"
          >
            {loading ? 'Confirming...' : 'Yes, Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
