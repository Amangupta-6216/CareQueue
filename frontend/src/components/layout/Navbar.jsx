import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import { Bell, LogOut, LayoutDashboard, User } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket || !user) return;

    const handleStatusChange = (data) => {
      const msg = `Appointment status updated: ${data.status.toUpperCase()}`;
      addNotification(msg);
    };

    const handleNextPatient = (data) => {
      if (user.role === 'doctor' || user.role === 'admin') {
        addNotification(`Now seeing patient: ${data.appointment?.patient?.name || 'Patient'}`);
      }
    };

    socket.on('appointment:statusChange', handleStatusChange);
    socket.on('doctor:nextPatient', handleNextPatient);

    return () => {
      socket.off('appointment:statusChange');
      socket.off('doctor:nextPatient');
    };
  }, [socket, user]);

  const addNotification = (text) => {
    const newNotif = {
      id: Date.now(),
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 7)]);
    setUnreadCount((prev) => prev + 1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'patient': return '/dashboard/patient';
      case 'doctor': return '/dashboard/doctor';
      case 'receptionist': return '/dashboard/receptionist';
      case 'admin': return '/dashboard/admin';
      default: return '/';
    }
  };

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-sm">
      {/* Top Announcement Bar */}
      <div className="bg-[#FAD4D4] text-slate-800 text-xs font-medium py-1.5 px-4 text-center tracking-wide">
        Gentle care for every patient.
      </div>

      {/* Main Navbar */}
      <nav className="bg-white border-b border-slate-100 px-6 lg:px-12 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 hover:opacity-90 transition-opacity">
            CareQueue
          </Link>

          {/* Navigation Links & Actions */}
          <div className="flex items-center space-x-6 sm:space-x-8 text-sm font-medium text-slate-700">
            <Link 
              to="/" 
              className={`hover:text-slate-950 transition-colors pb-0.5 ${location.pathname === '/' ? 'text-slate-950 border-b-2 border-slate-900 font-semibold' : ''}`}
            >
              Home
            </Link>

            <button 
              type="button"
              onClick={() => scrollToSection('about-us')}
              className="hover:text-slate-950 transition-colors hidden md:inline-block"
            >
              About Us
            </button>

            <button 
              type="button"
              onClick={() => scrollToSection('our-services')}
              className="hover:text-slate-950 transition-colors hidden md:inline-block"
            >
              Our Services
            </button>

            <button 
              type="button"
              onClick={() => scrollToSection('contact-us')}
              className="hover:text-slate-950 transition-colors hidden md:inline-block"
            >
              Contact Us
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifMenu(!showNotifMenu);
                      setUnreadCount(0);
                    }}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
                    title="Live Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl p-4 space-y-3 z-50 text-slate-800">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Notifications</span>
                        <span className="text-[10px] text-slate-400">{notifications.length} alerts</span>
                      </div>

                      {notifications.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-400">No new alerts yet.</div>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto">
                          {notifications.map((n) => (
                            <div key={n.id} className="p-2 bg-slate-50 rounded-xl text-xs border border-slate-100">
                              <div className="text-slate-800 font-medium">{n.text}</div>
                              <div className="text-[10px] text-slate-400">{n.time}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1.5 transition-colors hidden sm:inline-block"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="bg-[#F6B2B2] hover:bg-[#F29F9F] text-slate-900 font-semibold px-4 py-2 rounded-lg text-xs sm:text-sm shadow-sm transition-all transform hover:-translate-y-0.5"
                >
                  Book Appointment
                </Link>
              </div>
            )}
          </div>

        </div>
      </nav>
    </header>
  );
};

export default Navbar;
