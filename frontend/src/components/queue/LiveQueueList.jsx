import React from 'react';
import { AlertTriangle, Clock, UserCheck, HeartHandshake, ShieldAlert, Sparkles, Activity } from 'lucide-react';

const getUrgencyConfig = (level) => {
  switch (Number(level)) {
    case 1:
      return {
        label: 'Level 1 • Critical',
        shortLabel: 'L1 Critical',
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold animate-pulse',
        rowHighlight: 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200 shadow-sm',
        numberBg: 'bg-rose-600 text-white shadow-rose-200'
      };
    case 2:
      return {
        label: 'Level 2 • Urgent',
        shortLabel: 'L2 Urgent',
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
        rowHighlight: 'bg-amber-50/50 border-amber-200 shadow-sm',
        numberBg: 'bg-amber-500 text-white shadow-amber-200'
      };
    case 3:
    default:
      return {
        label: 'Level 3 • Standard',
        shortLabel: 'L3 Standard',
        badgeClass: 'bg-slate-100 text-slate-700 border-slate-300 font-semibold',
        rowHighlight: 'bg-white border-slate-200 hover:border-slate-300 shadow-sm',
        numberBg: 'bg-slate-100 text-slate-700'
      };
  }
};

export const LiveQueueList = ({
  queue,
  onNoShow,
  onEmergencyToggle,
  onUrgencyChange,
  canManage = false
}) => {
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
      {/* Informational Academic Prototype Banner */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 font-medium">
          <Activity className="w-4 h-4 text-[#D87070] shrink-0" />
          <span>Ordering: <strong>Urgency Level</strong> (asc) &rarr; <strong>Arrival Time</strong> (asc)</span>
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">Academic Prototype Triage</span>
      </div>

      {queue.map((item, index) => {
        const urgency = item.urgencyLevel || 3;
        const config = getUrgencyConfig(urgency);
        const isEmergency = Boolean(item.isEmergency);
        const isSenior = Boolean(item.isSeniorCitizen);

        // Format arrival time
        let joinedTimeStr = '';
        if (item.joinedAt) {
          try {
            joinedTimeStr = new Date(item.joinedAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
          } catch (e) {
            joinedTimeStr = '';
          }
        }

        const waitMins = typeof item.waitDurationMinutes === 'number'
          ? item.waitDurationMinutes
          : null;

        return (
          <div
            key={item.appointmentId || item.queueEntryId || index}
            className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              index === 0 && urgency !== 1
                ? 'bg-[#FDF0F2]/50 border-[#F6B2B2] shadow-sm'
                : config.rowHighlight
            }`}
          >
            {/* Position & Patient Details */}
            <div className="flex items-start space-x-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm mt-0.5 ${
                  index === 0 && urgency !== 1 ? 'bg-[#F6B2B2] text-slate-900' : config.numberBg
                }`}
              >
                #{index + 1}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.patientName || 'Patient'}
                  </h4>

                  {/* Urgency Badge */}
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${config.badgeClass}`}
                    title="Staff-assigned clinical urgency"
                  >
                    {config.label}
                  </span>

                  {/* Operational Emergency Alert Tag (Metadata) */}
                  {isEmergency && (
                    <span
                      className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                      title="Clinical emergency alert flag"
                    >
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      Emergency Alert
                    </span>
                  )}

                  {/* Senior Citizen Tag (Metadata) */}
                  {isSenior && (
                    <span
                      className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full"
                      title="Senior Citizen (60+ yrs)"
                    >
                      <HeartHandshake className="w-3 h-3 text-amber-600" />
                      Senior (60+)
                    </span>
                  )}
                </div>

                {/* Timing & Contact Info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  {item.patientPhone && (
                    <span>{item.patientPhone}</span>
                  )}

                  {joinedTimeStr && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Joined: {joinedTimeStr}
                    </span>
                  )}

                  {waitMins !== null && (
                    <span className="text-slate-500 font-medium">
                      Wait: {waitMins} min{waitMins === 1 ? '' : 's'}
                    </span>
                  )}

                  {item.urgencyAssignedBy && (
                    <span className="text-[11px] text-slate-400">
                      (Assigned by: {item.urgencyAssignedBy})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Staff / Doctor Urgency Reassessment & Actions */}
            {canManage && (
              <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                {/* Urgency Selector */}
                {onUrgencyChange && (
                  <div className="flex items-center gap-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden lg:inline">
                      Urgency:
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) =>
                        onUrgencyChange(item.doctorId, item.appointmentId, Number(e.target.value))
                      }
                      className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] cursor-pointer shadow-xs"
                      title="Update staff-assigned urgency level"
                    >
                      <option value={1}>L1 - Critical</option>
                      <option value={2}>L2 - Urgent</option>
                      <option value={3}>L3 - Standard</option>
                    </select>
                  </div>
                )}

                {/* Optional Emergency Flag Toggle (Metadata) */}
                {onEmergencyToggle && (
                  <button
                    onClick={() =>
                      onEmergencyToggle(item.doctorId, item.appointmentId, !isEmergency)
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isEmergency
                        ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                    title="Toggle clinical emergency alert metadata"
                  >
                    {isEmergency ? 'Clear Alert' : 'Flag Alert'}
                  </button>
                )}

                {/* Mark as No-Show */}
                {onNoShow && (
                  <button
                    onClick={() => onNoShow(item.doctorId, item.appointmentId)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                    title="Mark patient as absent"
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
