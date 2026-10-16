import React from 'react';
import { formatDoctorName } from '../../utils/formatters';
import { UserCheck, Award, Clock, DollarSign, Calendar, AlertCircle, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const DoctorProfileModal = ({ doctor, isOpen, onClose, onSelectForBooking }) => {
  if (!isOpen || !doctor) return null;

  const isCurrentlyOnLeave = doctor.onLeave || (doctor.leaveRequests || []).some(lr => lr.status === 'approved' && lr.date === new Date().toISOString().split('T')[0]);
  const approvedLeaveDates = (doctor.leaveRequests || []).filter(lr => lr.status === 'approved').map(lr => lr.date);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 max-w-lg w-full space-y-6 relative shadow-2xl text-slate-900">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Doctor Header */}
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-[#FDF0F2] border border-[#F6B2B2]/40 text-[#D87070] flex items-center justify-center shrink-0">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900">{formatDoctorName(doctor.user?.name)}</h2>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs font-semibold text-[#D87070] uppercase tracking-wider mt-0.5">{doctor.department}</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              {doctor.qualification || 'MBBS, MD'} • {doctor.specialization || doctor.department}
            </p>
          </div>
        </div>

        {/* Leave Status Indicator */}
        {isCurrentlyOnLeave ? (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <span className="font-bold text-rose-800">Unavailable / On Approved Leave Today</span>
              <p className="text-[11px] text-rose-600">Regular consultation slots are temporarily suspended.</p>
            </div>
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold text-emerald-800">Available for Appointments</span>
              <p className="text-[11px] text-emerald-700">Accepting online & walk-in bookings today.</p>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Consultation Fee</span>
            <div className="text-base font-bold text-emerald-700">${doctor.consultationFee || 500}</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold">Slot Duration</span>
            <div className="text-base font-bold text-slate-800">30 Minutes</div>
          </div>
        </div>

        {/* Approved Leave Dates Calendar */}
        {approvedLeaveDates.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-600" />
              Scheduled Approved Leave Dates
            </span>
            <div className="flex flex-wrap gap-2">
              {approvedLeaveDates.map((d, i) => (
                <span key={i} className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs font-semibold">
                  📅 {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => {
            onSelectForBooking(doctor);
            onClose();
          }}
          className="w-full py-3 bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 font-bold rounded-xl shadow-md text-sm transition-all transform hover:-translate-y-0.5"
        >
          Proceed to Book Appointment
        </button>
      </div>
    </div>
  );
};

export default DoctorProfileModal;
