import React from 'react';
import { Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export const SlotPicker = ({ slots, selectedSlot, onSelectSlot, selectedDate, onDateChange, isOnLeave = false }) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const isPastSlot = (slotDate, startTimeStr) => {
    if (!slotDate || !startTimeStr) return false;
    if (slotDate < todayStr) return true;
    if (slotDate > todayStr) return false;

    const [hStr, mStr] = startTimeStr.split(':');
    const slotMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
    return slotMinutes <= currentMinutes;
  };

  return (
    <div className="space-y-4">
      {/* Date Selector */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#D87070]" />
          Select Date:
        </label>
        <input
          type="date"
          min={todayStr}
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white"
        />
      </div>

      {/* Leave Notice or Time Slots Grid */}
      {isOnLeave ? (
        <div className="text-center py-8 rounded-2xl border border-rose-200 bg-rose-50 text-rose-800 text-sm space-y-2 p-4">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <div className="font-bold text-base text-rose-800">Doctor Not Available</div>
          <p className="text-xs text-rose-700 max-w-xs mx-auto">
            This doctor is on approved leave for <span className="font-bold underline">{selectedDate}</span>. Please choose a different date.
          </p>
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-8 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm">
          <AlertCircle className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          No available slots found for this date.
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {slots.map((slot) => {
            const isSelected = selectedSlot && selectedSlot._id === slot._id;
            const isBooked = Boolean(slot.isBooked);
            const isPast = isPastSlot(selectedDate, slot.startTime);
            const isDisabled = isBooked || isPast;

            return (
              <button
                key={slot._id}
                type="button"
                disabled={isDisabled}
                onClick={() => !isDisabled && onSelectSlot(slot)}
                title={
                  isBooked
                    ? 'Already booked by another patient'
                    : isPast
                    ? 'This time slot has passed for today'
                    : `Book ${slot.startTime}`
                }
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isDisabled
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/80 line-through opacity-60'
                    : isSelected
                    ? 'bg-[#F6B2B2] text-slate-900 border border-[#E5989B] shadow-md font-bold scale-[0.98]'
                    : 'bg-white text-slate-700 hover:bg-[#FDF0F2] hover:border-[#F6B2B2] border border-slate-200 shadow-sm'
                }`}
              >
                <Clock className="w-3.5 h-3.5 opacity-70" />
                <span>{slot.startTime}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-1 text-slate-900" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SlotPicker;
