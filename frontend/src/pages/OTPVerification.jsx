import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const OTPVerification = () => {
  const { user, login, updateProfile } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const phone = user?.phone;

  useEffect(() => {
    if (!phone) {
      toast.error('Mobile number missing. Please restart login.');
      navigate('/login');
    }
  }, [phone, navigate]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (pasteData.length === 6 && !isNaN(pasteData)) {
      const pasteOtp = pasteData.split('');
      setOtp(pasteOtp);
      inputRefs.current[5].focus();
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      await api.post('/auth/send-otp', { phone });
      toast.success('OTP resent. Dev OTP: 123456');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to resend OTP';
      toast.error(errMsg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/verify-otp', { phone, otp: otpValue });
      const { token, user: loggedUser } = res.data;

      login(token, loggedUser);
      toast.success('Successfully logged in!');

      if (loggedUser.kycStatus === 'rejected') {
        setRejectionReason(loggedUser.rejectionReason || 'Documents did not meet our verification standards.');
        setShowRejectionModal(true);
      } else if (loggedUser.kycStatus === 'pending_review') {
        navigate('/kyc/pending');
      } else if (loggedUser.isKycVerified) {
        navigate('/dashboard');
      } else {
        navigate('/kyc');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Invalid or expired OTP';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleReuploadSubmit = async () => {
    try {
      setLoading(true);
      await api.post('/kyc/reupload');
      updateProfile({ kycStatus: 'in_progress', isKycVerified: false, rejectionReason: null });
      toast.success('KYC reset. Please re-upload your documents.');
      navigate('/kyc/aadhaar');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset KYC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <button
        onClick={() => navigate('/login')}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-primary mb-6 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Change Number</span>
      </button>

      <h2 className="text-xl font-bold text-darkText mb-2 text-center">Verify OTP</h2>
      <p className="text-sm text-gray-500 text-center mb-6">
        Enter the 6-digit OTP sent to <br />
        <span className="font-semibold text-darkText">{phone}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              pattern="\d*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
            />
          ))}
        </div>

        <div className="flex justify-between items-center text-sm">
          {timer > 0 ? (
            <span className="text-gray-400">Resend OTP in {timer}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-primary font-bold hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-4 bg-primary hover:bg-primary-dark disabled:bg-gray-200 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:shadow-none hover:shadow-primary-dark/30 transition-all duration-300 active:scale-[0.98]"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span>Verify & Log In</span>
          )}
        </button>
      </form>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-8 w-full max-w-md animate-scale text-center space-y-6">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 bg-rose-600 flex items-center justify-center rounded-2xl text-white font-extrabold text-lg mb-2 shadow-lg shadow-rose-600/20">
                L
              </div>
              <h3 className="text-xl font-extrabold text-darkText">KYC Rejected</h3>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">Verification Alert</p>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 text-left space-y-1.5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-rose-500">Rejection Reason</p>
              <p className="text-sm font-bold text-rose-900 leading-relaxed italic">
                "{rejectionReason}"
              </p>
            </div>

            <p className="text-sm text-gray-500 leading-normal px-2">
              Please re-upload your documents. You will need to complete the verification hub again.
            </p>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleReuploadSubmit}
                disabled={loading}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Resetting KYC...' : 'Reupload Documents'}
              </button>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  navigate('/kyc');
                }}
                className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl active:scale-[0.98] transition-all"
              >
                Go to Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTPVerification;
