import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ShieldCheck, Mail, Lock } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/admin/login', { email, password });
      const { token } = res.data;

      // Store admin token in sessionStorage as 'admin_token'
      sessionStorage.setItem('admin_token', token);

      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Authentication failed';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-lightBg flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-100/30 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 shadow-xl p-8 relative z-10 slide-up">
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-darkText flex items-center justify-center rounded-2xl text-white font-extrabold text-lg shadow-lg mb-3">
            L
          </div>
          <h1 className="text-2xl font-extrabold text-darkText tracking-tight">Loopozone</h1>
          <p className="text-sm text-gray-400 mt-1 font-semibold flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1 rounded-xl">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Admin Console</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-darkText block">Email ID</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@loopozone.com"
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-darkText block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-darkText hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-black/20 transition-all duration-300 active:scale-[0.98] disabled:bg-gray-400 disabled:shadow-none"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Access Dashboard</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
