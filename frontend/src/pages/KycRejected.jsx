import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { AlertOctagon, RefreshCcw, LogOut } from 'lucide-react';
import api from '../api/axios';

const KycRejected = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const reason = user?.rejectionReason || 'Documents did not meet our verification standards.';
    toast.error(
      `KYC Rejected. Reason: "${reason}". Please reupload your documents.`,
      { duration: 8000, position: 'top-center' }
    );
  }, [user]);

  const handleReupload = async () => {
    try {
      await api.post('/kyc/reupload');
      updateProfile({ kycStatus: 'in_progress', isKycVerified: false, rejectionReason: null });
      toast.success('KYC reset. Please re-upload your documents.');
      navigate('/kyc/aadhaar');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset KYC');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-lightBg flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-rose-100/30 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 p-8 relative z-10 text-center space-y-8 py-12 slide-up">
        {/* Header Logo */}
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 bg-rose-600 flex items-center justify-center rounded-2xl text-white font-extrabold text-lg shadow-lg shadow-rose-600/25 mb-3">
            L
          </div>
          <h1 className="text-2xl font-extrabold text-darkText tracking-tight">Loopozone</h1>
          <p className="text-sm text-gray-400 mt-1 font-semibold">Verification Alert</p>
        </div>

        {/* Warning Icon */}
        <div className="relative flex justify-center items-center py-2">
          <div className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-rose-600/10 opacity-75"></div>
          <div className="relative bg-rose-50 p-5 rounded-full text-rose-600 border border-rose-100 shadow-inner">
            <AlertOctagon className="h-10 w-10 animate-bounce" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-extrabold text-darkText">KYC Rejected</h2>
          <p className="text-sm text-gray-500 leading-normal px-4">
            Unfortunately, your identity verification was rejected by our compliance team.
          </p>
        </div>

        {/* Rejection Reason Card */}
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 text-left space-y-2">
          <p className="text-[10px] uppercase font-bold tracking-wider text-rose-500">Rejection Reason</p>
          <p className="text-sm font-bold text-rose-900 leading-relaxed italic">
            "{user?.rejectionReason || 'Documents did not meet our verification standards.'}"
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleReupload}
            className="w-full py-4 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl flex items-center justify-center gap-2.5 shadow-lg shadow-primary/25 hover:shadow-primary-dark/30 transition-all duration-300 active:scale-[0.98]"
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Reupload Documents</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-4 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl flex items-center justify-center gap-2.5 border border-rose-100 transition-all duration-300 active:scale-[0.98]"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout and Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KycRejected;
