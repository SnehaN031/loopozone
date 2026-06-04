import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { CheckCircle2, Clock, LogOut } from 'lucide-react';

const KYCPending = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Poll the KYC status
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/kyc/status');
        const { kycStatus, isKycVerified, rejectionReason } = res.data;

        if (kycStatus !== user?.kycStatus || isKycVerified !== user?.isKycVerified) {
          updateProfile({ kycStatus, isKycVerified, rejectionReason });
          
          if (kycStatus === 'approved') {
            toast.success('KYC Approved! Welcome aboard.');
            navigate('/dashboard');
          } else if (kycStatus === 'rejected') {
            toast.error('KYC Rejected. Please see the rejection reason.');
            navigate('/kyc');
          }
        }
      } catch (err) {
        console.error('Failed to poll status:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, navigate, updateProfile]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-lightBg flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-amber-100/30 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 p-8 relative z-10 text-center space-y-8 py-12 slide-up">
        {/* Header Logo */}
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 bg-primary flex items-center justify-center rounded-2xl text-white font-extrabold text-lg shadow-lg shadow-primary/20 mb-3">
            L
          </div>
          <h1 className="text-2xl font-extrabold text-darkText tracking-tight">Loopozone</h1>
          <p className="text-sm text-gray-400 mt-1 font-semibold">Identity Hub</p>
        </div>

        {/* Big Checkmark Icon */}
        <div className="relative flex justify-center items-center py-4">
          <div className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-emerald-400/10 opacity-75"></div>
          <div className="relative bg-emerald-50 p-5 rounded-full text-emerald-600 border border-emerald-100 shadow-inner">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-extrabold text-emerald-600">Documents Submitted Successfully!</h2>
          <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-xs font-semibold text-amber-700 flex items-center gap-2.5 justify-center">
            <Clock className="h-4 w-4 shrink-0 animate-spin" />
            <span>Your documents are under review.</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed px-4 pt-2">
            This usually takes 24-48 hours. You will be notified once approved.
          </p>
        </div>

        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 justify-center mx-auto text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-5 py-3 rounded-xl border border-rose-100 transition-all duration-300"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout and Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KYCPending;
