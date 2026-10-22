import React from 'react';
import { UserCheck, CheckCircle2, UserX, AlertTriangle, Phone, Activity } from 'lucide-react';

export const NextPatientCard = ({ inProgressPatient, nextInQueue, onCallNext, onMarkDone, onNoShow }) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 relative overflow-hidden shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Active Consultation Room
          </h3>
        </div>
        {inProgressPatient && (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full">
            In Progress
          </span>
        )}
      </div>

      {inProgressPatient ? (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Currently Seeing</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-1">
                {inProgressPatient.patientId?.name || inProgressPatient.patientName || 'Patient'}
              </h2>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D87070]" />
                {inProgressPatient.patientId?.phone || 'No phone provided'}
              </p>
            </div>

            {inProgressPatient.isEmergency && (
              <span className="bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs px-3 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Emergency Case
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onMarkDone()}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              Mark Consultation Done & Call Next
            </button>

            <button
              onClick={() => onNoShow(inProgressPatient.appointmentId?._id || inProgressPatient.appointmentId)}
              className="bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-semibold py-3 px-4 rounded-xl border border-slate-200 transition-colors flex items-center gap-2"
            >
              <UserX className="w-5 h-5" />
              Patient Absent (No-Show)
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FDF0F2] text-[#D87070] border border-[#F6B2B2]/40 flex items-center justify-center mx-auto mb-3">
            <Activity className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">No Consultation In Progress</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {nextInQueue
              ? `Next patient in queue is ${nextInQueue.patientName} (Position #1).`
              : 'The queue is currently clear.'}
          </p>

          <button
            onClick={() => onCallNext()}
            disabled={!nextInQueue}
            className={`mt-6 px-6 py-3 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 mx-auto transition-all ${
              nextInQueue
                ? 'bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 shadow-md transform hover:-translate-y-0.5'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            Call Next Patient Now
          </button>
        </div>
      )}
    </div>
  );
};

export default NextPatientCard;
