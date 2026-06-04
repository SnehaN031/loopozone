import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, CheckCircle2, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

const VerificationProcessing = () => {
  const { user, logout } = useAuth();
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    'Scanning Aadhaar Document Text...',
    'Validating Tax Identity with NSDL...',
    'Performing biometric face matching...'
  ];

  useEffect(() => {
    const phone = user?.phone;
    const stepInterval = setInterval(() => {
      setStep((prev) => (prev < 2 ? prev + 1 : prev));
    }, 4500);

    const pollInterval = setInterval(async () => {
      try {
        const res = await api.get('/kyc/status');
        const { isKycVerified } = res.data;

        if (isKycVerified) {
          clearInterval(pollInterval);
          clearInterval(stepInterval);
          logout();
          toast.success('KYC Verification Completed! Please verify OTP to log in.');
          navigate('/login', { state: { phone } });
        }
      } catch (err) {
        console.error('Polling failed:', err);
      }
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(stepInterval);
    };
  }, [navigate, logout, user]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-3xl border border-gray-200 p-8 shadow-sm text-center space-y-8 py-12 fade-in">
      <div className="relative flex justify-center items-center">
        <div className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-primary/10 opacity-75"></div>
        <div className="relative bg-primary/20 p-5 rounded-full text-primary border border-primary/30">
          <ShieldCheck className="h-10 w-10 animate-pulse" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-darkText">Verification in Progress</h2>
        <p className="text-sm text-gray-500">Checking documentation authenticity automatically.</p>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 text-left border border-gray-200 space-y-4">
        {steps.map((text, idx) => {
          const isDone = step > idx;
          const isCurrent = step === idx;

          return (
            <div key={idx} className="flex items-center gap-3">
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0"></div>
              ) : (
                <Circle className="h-5 w-5 text-gray-300 shrink-0" />
              )}
              <span className={`text-xs font-semibold ${isCurrent ? 'text-primary' : isDone ? 'text-emerald-700' : 'text-gray-400'}`}>
                {text}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-400">
        Estimated remaining time: <span className="font-semibold text-darkText">~10 seconds</span>
      </div>
    </div>
  );
};

export default VerificationProcessing;
