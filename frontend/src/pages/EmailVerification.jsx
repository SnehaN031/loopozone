import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Mail, LogOut } from 'lucide-react';

const EmailVerification = () => {
  const { user, login, logout, updateProfile } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const email = user?.email;

  useEffect(() => {
    if (!email) {
      toast.error('Email address is missing. Please restart.');
      logout();
      navigate('/login');
      return;
    }
    // Auto-trigger OTP send on component mount
    triggerSendOtp(true);
  }, [email]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const triggerSendOtp = async (isInitial = false) => {
    try {
      setSending(true);
      await api.post('/auth/send-email-otp');
      if (isInitial) {
        toast.success('Static verification code sent to your email!');
      } else {
        toast.success('New static code has been sent to your email!');
      }
      setTimer(300); // Reset timer to 5 minutes
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to send verification code';
      toast.error(errMsg);
    } finally {
      setSending(false);
    }
  };

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input box
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

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogout = () => {
    logout();
    toast.success('Session exited');
    navigate('/login');
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
      const res = await api.post('/auth/verify-email-otp', { otp: otpValue });
      const { user: updatedUser } = res.data;

      // Update the user session in AuthContext
      updateProfile({ isEmailVerified: true });
      toast.success('Email verified successfully!');

      if (updatedUser.isKycVerified) {
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

  return (
    <div className="min-h-screen bg-lightBg flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative premium gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-emerald-100/30 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/50 p-8 relative z-10 slide-up">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-primary flex items-center justify-center rounded-2xl text-white font-extrabold text-lg shadow-lg shadow-primary/20 mb-3">
            L
          </div>
          <h1 className="text-2xl font-extrabold text-darkText tracking-tight">Loopozone</h1>
          <p className="text-sm text-gray-400 mt-1">KYC Onboarding Platform</p>
        </div>

        <div className="fade-in">
          {/* Back/Exit Action */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-1.5 text-primary text-xs font-bold bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
              <Mail className="h-3.5 w-3.5" />
              <span>Email Verification</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/85 px-3 py-1.5 rounded-xl border border-rose-100 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>

          <h2 className="text-xl font-bold text-darkText mb-2 text-center">Verify Email</h2>
          <p className="text-sm text-gray-500 text-center mb-6 leading-normal">
            Enter the 6-digit OTP code sent to <br />
            <span className="font-semibold text-darkText break-all">{email}</span>
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
                  disabled={loading || sending}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-bold border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 disabled:bg-gray-50 disabled:text-gray-400"
                />
              ))}
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">
                Development OTP: <span className="font-extrabold text-primary">654321</span>
              </span>
              {timer > 0 ? (
                <span className="text-gray-400 font-semibold">Resend in {formatTimer(timer)}</span>
              ) : (
                <button
                  type="button"
                  disabled={sending || loading}
                  onClick={() => triggerSendOtp(false)}
                  className="text-primary font-bold hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || sending}
              className="w-full py-4 px-4 bg-primary hover:bg-primary-dark disabled:bg-gray-200 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:shadow-none hover:shadow-primary-dark/30 transition-all duration-300 active:scale-[0.98]"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Verify & Continue</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
