import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, ArrowRight, ArrowLeft } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const phone = location.state?.phone || user?.phone || '';

  useEffect(() => {
    if (!phone) {
      toast.error('Mobile number is missing. Please restart.');
      navigate('/');
    }
  }, [phone, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Valid email is required');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/signup', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone
      });

      const { user: registeredUser, token } = res.data;
      login(token, registeredUser); // Set profile and token in context
      
      toast.success('Registration successful! Initiate KYC document uploads.');
      navigate('/kyc');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || 'Registration failed';
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

      <h2 className="text-xl font-bold text-darkText mb-2 text-center">Complete Profile</h2>
      <p className="text-sm text-gray-500 text-center mb-6">Enter registration details to begin onboarding.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Mobile Number (Verified)
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
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <User className="h-5 w-5" />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sneha Nair"
              disabled={loading}
              className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium text-darkText"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@domain.com"
              disabled={loading}
              className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-medium text-darkText"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-4 bg-primary hover:bg-primary-dark disabled:bg-gray-200 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:shadow-none hover:shadow-primary-dark/30 transition-all duration-300 active:scale-[0.98] mt-6"
        >
          {loading ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Continue to KYC</span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Signup;
