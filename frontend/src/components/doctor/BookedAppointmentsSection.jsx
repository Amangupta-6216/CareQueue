import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Stethoscope,
  Sparkles,
  UserCheck,
  CalendarDays
} from 'lucide-react';

export const BookedAppointmentsSection = ({
  appointments = [],
  selectedDate,
  onDateChange,
  doctorName = 'Doctor'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Format date display (e.g. "Monday, 19 Oct 2026")
  const formattedDate = useMemo(() => {
    if (!selectedDate) return '';
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const dateObj = new Date(year, month, day);
        return dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
      return selectedDate;
    } catch (e) {
      return selectedDate;
    }
  }, [selectedDate]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isToday = selectedDate === todayStr;

  // Filter and search logic
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Status filter
      if (statusFilter === 'booked' && apt.status !== 'booked') return false;
      if (statusFilter === 'active' && !['checked-in', 'in-queue', 'in-progress'].includes(apt.status)) return false;
      if (statusFilter === 'done' && apt.status !== 'done') return false;
      if (statusFilter === 'cancelled' && !['cancelled', 'no-show'].includes(apt.status)) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const patientName = (apt.patient?.name || '').toLowerCase();
        const patientPhone = (apt.patient?.phone || '').toLowerCase();
        const patientEmail = (apt.patient?.email || '').toLowerCase();
        const reason = (apt.reasonForVisit || '').toLowerCase();
        const time = (apt.startTime || '').toLowerCase();

        return (
          patientName.includes(q) ||
          patientPhone.includes(q) ||
          patientEmail.includes(q) ||
          reason.includes(q) ||
          time.includes(q)
        );
      }

      return true;
    });
  }, [appointments, statusFilter, searchQuery]);

  // Counts
  const counts = useMemo(() => {
    return {
      total: appointments.length,
      booked: appointments.filter(a => a.status === 'booked').length,
      active: appointments.filter(a => ['checked-in', 'in-queue', 'in-progress'].includes(a.status)).length,
      done: appointments.filter(a => a.status === 'done').length,
      cancelled: appointments.filter(a => ['cancelled', 'no-show'].includes(a.status)).length
    };
  }, [appointments]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'booked':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Scheduled
          </span>
        );
      case 'checked-in':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Checked In
          </span>
        );
      case 'in-queue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            In Waiting Queue
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 ring-1 ring-emerald-200 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            In Consultation
          </span>
        );
      case 'done':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
            Cancelled
          </span>
        );
      case 'no-show':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            No Show
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 shadow-sm rounded-3xl p-6 sm:p-7 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FDF0F2] text-[#D87070] border border-[#F6B2B2]/40 flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Booked Patient Appointments
            </h3>
            <span className="bg-[#FDF0F2] text-[#D87070] font-black text-xs px-2.5 py-0.5 rounded-full border border-[#F6B2B2]/50">
              {appointments.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Schedule for <span className="font-semibold text-slate-800">{formattedDate}</span>
            {isToday && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Today
              </span>
            )}
          </p>
        </div>

        {/* Date Selector in Section */}
        {onDateChange && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs self-start sm:self-auto">
            <Calendar className="w-4 h-4 text-[#D87070]" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
              title="Change schedule date"
            />
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All ({counts.total})
          </button>
          <button
            onClick={() => setStatusFilter('booked')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'booked'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Scheduled ({counts.booked})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'active'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Arrived / Queue ({counts.active})
          </button>
          <button
            onClick={() => setStatusFilter('done')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              statusFilter === 'done'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Completed ({counts.done})
          </button>
          {counts.cancelled > 0 && (
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === 'cancelled'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Cancelled ({counts.cancelled})
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, phone, reason..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F6B2B2] focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Appointment Cards / List */}
      {filteredAppointments.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50/70 rounded-2xl border border-slate-200/80">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF0F2] text-[#D87070] border border-[#F6B2B2]/40 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-800">
            {appointments.length === 0
              ? `No Appointments Booked on ${formattedDate}`
              : 'No matching appointments found'}
          </h4>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto">
            {appointments.length === 0
              ? `Any patient who books an appointment for this date will automatically appear here with their booked slot time, reason, and contact details.`
              : 'Try clearing your search query or switching filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((apt, index) => {
            const patient = apt.patient || {};
            const isSenior = Boolean(patient.isSeniorCitizen);
            const isEmergency = Boolean(apt.isEmergency);

            return (
              <div
                key={apt._id || index}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-[#F6B2B2] hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Slot Time Badge & Patient Demographics */}
                <div className="flex items-start gap-4">
                  {/* Slot Time Pill */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-[#F6B2B2] mb-0.5" />
                    <span className="text-sm font-black tracking-tight">{apt.startTime || 'TBD'}</span>
                    <span className="text-[9px] text-slate-400 uppercase font-semibold">Slot</span>
                  </div>

                  {/* Patient Info */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-black text-slate-900">
                        {patient.name || 'Patient'}
                      </h4>

                      {isSenior && (
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                          <HeartHandshake className="w-3 h-3 text-amber-600" />
                          Senior (60+)
                        </span>
                      )}

                      {isEmergency && (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-800 border border-rose-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full animate-pulse">
                          Emergency
                        </span>
                      )}

                      <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {apt.isWalkIn ? 'Walk-In' : 'Online Booking'}
                      </span>
                    </div>

                    {/* Contact details */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                      {patient.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#D87070]" />
                          {patient.phone}
                        </span>
                      )}
                      {patient.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[#D87070]" />
                          {patient.email}
                        </span>
                      )}
                    </div>

                    {/* Reason for visit */}
                    <div className="text-xs text-slate-700 flex items-center gap-1.5 pt-1">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-600">Reason:</span>
                      <span className="text-slate-900 font-medium">
                        {apt.reasonForVisit || 'General Consultation'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status badge */}
                <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-500 md:text-right">
                    Status
                  </div>
                  {getStatusBadge(apt.status)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookedAppointmentsSection;
