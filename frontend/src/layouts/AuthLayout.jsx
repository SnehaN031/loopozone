import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const AuthLayout = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBg">
        <Loader size="large" />
      </div>
    );
  }

  // Redirect authenticated sessions
  if (isAuthenticated) {
    if (user?.isKycVerified) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/kyc" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-lightBg flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative premium gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-100/30 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 p-8 relative z-10 slide-up">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-primary flex items-center justify-center rounded-2xl text-white font-extrabold text-lg shadow-lg shadow-primary/20 mb-3">
            L
          </div>
          <h1 className="text-2xl font-extrabold text-darkText tracking-tight">Loopozone</h1>
          <p className="text-sm text-gray-400 mt-1">KYC Onboarding Platform</p>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
