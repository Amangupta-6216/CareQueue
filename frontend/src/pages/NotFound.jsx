import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900">404 - Page Not Found</h1>
      <p className="text-xs text-slate-500 max-w-sm">
        The requested URL does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-2 bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
      >
        <Home className="w-4 h-4" />
        Return Home
      </Link>
    </div>
  );
};

export default NotFound;
