import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Phone, ArrowRight, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const [phone, setPhone] = useState('+91');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateProfile } = useAuth();

  const phoneRegex = /^\+91[6-9]\d{9}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPhone = phone.trim().replace(/\s+/g, '');

    if (!phoneRegex.test(cleanPhone)) {
      toast.error('Invalid Indian phone number. Format: +919876543210');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/check-user', { phone: cleanPhone });
      const { redirect } = res.data;

      // Update phone in auth context
      updateProfile({ phone: cleanPhone });

      if (redirect === '/login') {
        toast.success('Welcome back! Please verify identity to login.');
        navigate('/login', { state: { phone: cleanPhone } });
      } else {
        toast.success('Create a new account to get started.');
        navigate('/signup', { state: { phone: cleanPhone } });
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Identity verification check failed';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in text-center space-y-8">
      {/* Onboarding Logo */}
      <div className="relative mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-inner">
        <Leaf className="h-12 w-12 animate-pulse" />
        <div className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 rounded-full border border-white" />
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-bold text-darkText">
          Loopozone Onboarding
        </h2>
        <p className="text-sm text-gray-500 font-medium px-4">
          India's Circular Economy Marketplace. Enter your mobile number to sign up or sign in.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-left max-w-sm mx-auto">
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
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              disabled={loading}
              className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-gray-50 disabled:text-gray-400 transition-all duration-200 font-semibold"
            />
          </div>
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
              <span>Continue</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <div className="pt-6 border-t border-gray-100 max-w-sm mx-auto text-center">
        <button
          type="button"
          onClick={() => navigate('/admin/login')}
          className="text-xs font-extrabold text-gray-400 hover:text-primary transition-colors duration-200"
        >
          Compliance Admin Portal
        </button>
      </div>
    </div>
  );
};

export default Landing;
