import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

export const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-800 font-sans">
            <Navbar />
            <main className="flex-1 w-full">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                
                <Route 
                  path="/login" 
                  element={
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                      <Login />
                    </div>
                  } 
                />
                
                <Route 
                  path="/register" 
                  element={
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                      <Register />
                    </div>
                  } 
                />
                
                <Route 
                  path="/unauthorized" 
                  element={
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                      <Unauthorized />
                    </div>
                  } 
                />

                {/* Role Protected Dashboards */}
                <Route
                  path="/dashboard/patient"
                  element={
                    <ProtectedRoute allowedRoles={['patient', 'admin']}>
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <PatientDashboard />
                      </div>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/doctor"
                  element={
                    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <DoctorDashboard />
                      </div>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/receptionist"
                  element={
                    <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <ReceptionistDashboard />
                      </div>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <AdminDashboard />
                      </div>
                    </ProtectedRoute>
                  }
                />

                <Route 
                  path="*" 
                  element={
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                      <NotFound />
                    </div>
                  } 
                />
              </Routes>
            </main>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
