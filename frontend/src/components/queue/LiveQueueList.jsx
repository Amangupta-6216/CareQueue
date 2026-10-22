import React from 'react';
import { AlertTriangle, Clock, UserCheck, ShieldAlert, HeartHandshake } from 'lucide-react';

export const LiveQueueList = ({ queue, onNoShow, onEmergencyToggle, canManage = false }) => {
  if (!queue || queue.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50/70 rounded-2xl border border-slate-200/80 text-slate-500">
        <UserCheck className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700">Queue is currently empty.</p>
        <p className="text-xs text-slate-500 mt-1">Checked-in patients will appear here in priority order.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {queue.map((item, index) => {
        const isEmergency = item.isEmergency;
        const isSenior = item.isSeniorCitizen;

        return (
          <div
            key={item.appointmentId || index}
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              isEmergency
                ? 'bg-rose-50 border-rose-300 ring-1 ring-rose-200 shadow-sm'
                : index === 0
                ? 'bg-[#FDF0F2]/60 border-[#F6B2B2] shadow-sm'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            {/* Position & Patient Info */}
            <div className="flex items-center space-x-4">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                  isEmergency
                    ? 'bg-rose-600 text-white animate-pulse'
                    : index === 0
                    ? 'bg-[#F6B2B2] text-slate-900 font-bold'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                #{index + 1}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.patientName || 'Patient'}
                  </h4>

                  {isEmergency && (
                    <span className="flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full animate-pulse">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Emergency
                    </span>
                  )}

                  {isSenior && (
                    <span className="flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full">
                      <HeartHandshake className="w-3 h-3 text-amber-600" />
                      Senior Citizen
                    </span>
                  )}
                </div>

                {item.patientPhone && (
                  <div className="text-xs text-slate-500 mt-0.5">
                    {item.patientPhone}
                  </div>
                )}
              </div>
            </div>

            {/* Admin/Receptionist Actions */}
            {canManage && (
              <div className="flex items-center space-x-2">
                {onEmergencyToggle && (
                  <button
                    onClick={() => onEmergencyToggle(item.doctorId, item.appointmentId, !isEmergency)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isEmergency
                        ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {isEmergency ? 'Remove Emergency' : 'Flag Emergency'}
                  </button>
                )}

                {onNoShow && (
                  <button
                    onClick={() => onNoShow(item.doctorId, item.appointmentId)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                  >
                    No-Show
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LiveQueueList;
