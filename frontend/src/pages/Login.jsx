import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Phone, ArrowRight, ArrowLeft } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, updateProfile } = useAuth();
  
  const phone = location.state?.phone || user?.phone || '';
  const [loading, setLoading] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    if (!phone) {
      toast.error('Mobile number is missing. Please restart.');
      navigate('/');
    }
  }, [phone, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/auth/send-otp', { phone });

      if (res.data.success && res.data.status === 'otp_sent') {
        toast.success('Static OTP sent! Use 123456');
        navigate('/verify-otp');
      } else if (res.data.pendingReview) {
        setShowPendingModal(true);
      } else if (res.data.rejected) {
        login(res.data.token, {
          phone,
          kycStatus: 'rejected',
          rejectionReason: res.data.reason,
          isKycVerified: false
        });
        toast.error(`KYC Rejected. Reason: "${res.data.reason}". Please reupload your documents.`, { duration: 6000 });
        navigate('/kyc/rejected');
      } else {
        toast.error(res.data.message || 'Could not initiate sign in.');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to send OTP';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-primary mb-6 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <h2 className="text-xl font-bold text-darkText mb-2 text-center">Verify Identity</h2>
      <p className="text-sm text-gray-500 text-center mb-6">Verify mobile number with static credentials</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Mobile Number
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Phone className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={phone}
              readOnly
              className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 font-semibold focus:outline-none cursor-not-allowed"
            />
          </div>
          <span className="block text-xs text-gray-400 mt-2 text-right">
            Development OTP: <span className="font-bold text-primary">123456</span>
          </span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-4 bg-primary hover:bg-primary-dark disabled:bg-gray-200 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:shadow-none hover:shadow-primary-dark/30 transition-all duration-300 active:scale-[0.98]"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Send OTP</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      {/* Pending Review Modal Overlay */}
      {showPendingModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-8 w-full max-w-md animate-scale text-center space-y-6">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 bg-primary flex items-center justify-center rounded-2xl text-white font-extrabold text-lg mb-2 shadow-lg shadow-primary/20">
                L
              </div>
              <h3 className="text-xl font-extrabold text-darkText">Verification Under Review</h3>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">Pending Approval</p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed font-semibold px-2">
              Your KYC verification is under review. Please wait for admin approval.
            </p>

            <button
              onClick={() => {
                setShowPendingModal(false);
                navigate('/');
              }}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
