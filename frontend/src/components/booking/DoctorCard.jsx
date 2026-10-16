import React from 'react';
import { formatDoctorName } from '../../utils/formatters';
import { UserCheck, Clock, Award, Info, CheckCircle2, AlertCircle } from 'lucide-react';

export const DoctorCard = ({ doctor, onSelect, isSelected, onViewProfile }) => {
  const name = formatDoctorName(doctor.user?.name);

  const isCurrentlyOnLeave = doctor.onLeave || (doctor.leaveRequests || []).some(lr => lr.status === 'approved' && lr.date === new Date().toISOString().split('T')[0]);
  const hasApprovedLeaveThisWeek = (doctor.leaveRequests || []).some(lr => lr.status === 'approved');

  return (
    <div
      className={`bg-white p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden shadow-sm ${
        isSelected
          ? 'ring-2 ring-[#F6B2B2] border-[#F6B2B2] bg-[#FDF0F2]/30 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Leave Status Indicator Badge */}
      {isCurrentlyOnLeave ? (
        <span className="absolute top-4 right-4 bg-rose-50 text-rose-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-rose-200 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 text-rose-500" />
          On Leave Today
        </span>
      ) : hasApprovedLeaveThisWeek ? (
        <span className="absolute top-4 right-4 bg-amber-50 text-amber-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
          <Clock className="w-3 h-3 text-amber-500" />
          Leave Scheduled
        </span>
      ) : (
        <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Available
        </span>
      )}

      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div
          onClick={() => onViewProfile && onViewProfile(doctor)}
          className="w-14 h-14 rounded-2xl bg-[#FDF0F2] border border-[#F6B2B2]/40 text-[#D87070] flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"
          title="Click to view full doctor profile"
        >
          <UserCheck className="w-7 h-7" />
        </div>

        <div className="flex-1 pr-16">
          <h3
            onClick={() => onViewProfile && onViewProfile(doctor)}
            className="text-lg font-bold text-slate-900 hover:text-[#D87070] cursor-pointer transition-colors"
          >
            {name}
          </h3>
          <p className="text-xs font-semibold text-[#D87070] uppercase tracking-wider mt-0.5">
            {doctor.department}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            {doctor.specialization || doctor.department}
          </p>
        </div>
      </div>

      {/* Details & Action Buttons */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500">Consultation Fee: </span>
          <span className="font-bold text-emerald-700">${doctor.consultationFee || 500}</span>
        </div>

        <div className="flex items-center space-x-2">
          {onViewProfile && (
            <button
              type="button"
              onClick={() => onViewProfile(doctor)}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 border border-slate-200 transition-colors"
            >
              <Info className="w-3 h-3 text-slate-500" />
              Profile
            </button>
          )}

          <button
            type="button"
            disabled={isCurrentlyOnLeave}
            onClick={() => !isCurrentlyOnLeave && onSelect(doctor)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isCurrentlyOnLeave
                ? 'bg-rose-50 text-rose-500 border border-rose-200 cursor-not-allowed'
                : isSelected
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-[#FDF0F2] text-[#B55050] border border-[#F6B2B2]/60 hover:bg-[#F6B2B2] hover:text-slate-900'
            }`}
          >
            {isCurrentlyOnLeave ? 'Unavailable Today' : isSelected ? 'Selected' : 'Select Slots'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
