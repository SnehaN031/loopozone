import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Shield, KeyRound, AlertCircle, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AadhaarUpload = () => {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'otp'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      toast.error('Valid 12-digit Aadhaar number is required');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/kyc/aadhaar/send-otp', { aadhaarNumber });
      if (res.data.success) {
        setReferenceId(res.data.referenceId);
        setStep('otp');
        toast.success('Aadhaar verification OTP sent!');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to send Aadhaar OTP';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error('Valid 6-digit OTP is required');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/kyc/aadhaar/verify-otp', {
        otp,
        referenceId,
        aadhaarNumber
      });
      if (res.data.success) {
        toast.success('Aadhaar verified successfully!');
        navigate('/kyc');
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Aadhaar verification failed';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <button
        onClick={() => {
          if (step === 'otp') {
            setStep('input');
            setOtp('');
          } else {
            navigate('/kyc');
          }
        }}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-primary transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{step === 'otp' ? 'Back' : 'Back to KYC Dashboard'}</span>
      </button>

      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="p-4 bg-primary/10 rounded-full text-primary inline-block">
            <Shield className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-darkText">Aadhaar OTP Verification</h2>
          <p className="text-sm text-gray-400">
            {step === 'input'
              ? 'Enter your Aadhaar number to verify your identity via government tax and UIDAI registries.'
              : 'Enter the 6-digit OTP sent to your Aadhaar-registered mobile number.'}
          </p>
        </div>

        {step === 'input' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                12-Digit Aadhaar Number
              </label>
              <input
                type="text"
                value={aadhaarNumber}
                onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                placeholder="e.g. 540123456789"
                maxLength={12}
                disabled={loading}
                className="block w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-semibold text-darkText tracking-widest text-center text-lg placeholder:text-sm placeholder:tracking-normal"
              />
            </div>

            <div className="flex gap-2.5 items-start bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs text-amber-800">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <p>
                Consent: I authorize Loopozone to verify my Aadhaar credentials against standard registries for client onboarding purposes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || aadhaarNumber.length !== 12}
              className="w-full py-4 px-4 bg-primary hover:bg-primary-dark disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:shadow-none hover:shadow-primary-dark/30 transition-all duration-300 active:scale-[0.98]"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                6-Digit Verification OTP
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <KeyRound className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP (Dev mode: 123456)"
                  maxLength={6}
                  disabled={loading}
                  className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-bold text-darkText tracking-widest text-center text-lg placeholder:text-sm placeholder:tracking-normal"
                />
              </div>
              <span className="block text-xs text-gray-400 mt-2 text-right">
                Reference ID: <span className="font-semibold text-darkText">{referenceId ? String(referenceId).slice(0, 10) : ''}...</span>
              </span>
            </div>

            <div className="flex gap-2.5 items-start bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs text-emerald-800">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                In development mode, use mock code <span className="font-bold">123456</span> to complete authentication.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full py-4 px-4 bg-primary hover:bg-primary-dark disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:shadow-none hover:shadow-primary-dark/30 transition-all duration-300 active:scale-[0.98]"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Verify & Activate</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AadhaarUpload;
