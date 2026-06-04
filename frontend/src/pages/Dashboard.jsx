import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

const timeAgo = (dateString) => {
  if (!dateString) return 'Updated 5m ago';
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Updated just now';
  if (diffMins < 60) return `Updated ${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Updated ${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `Updated ${diffDays}d ago`;
};

const getPercentChangePill = (p) => {
  const change = p.priceChange || 0;
  const current = p.pricePerKg;
  const previous = current - change;

  if (change === 0 || previous <= 0) {
    return (
      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gray-50 border border-gray-100 text-gray-400">
        Stable
      </span>
    );
  }

  const pct = (change / previous) * 100;
  const isUp = pct > 0;
  const colorClass = isUp ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100';
  const sign = isUp ? '+' : '';
  
  return (
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${colorClass}`}>
      {sign}{pct.toFixed(isUp ? 0 : 1)}%
    </span>
  );
};

const getCategoryStyle = (iconName) => {
  const name = iconName ? iconName.toLowerCase() : '';
  if (name.includes('drop') || name.includes('water')) {
    return {
      bg: 'bg-blue-50 border-blue-100/50',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      Icon: Icons.Droplet
    };
  }
  if (name.includes('pack') || name.includes('box') || name.includes('folder')) {
    return {
      bg: 'bg-orange-50 border-orange-100/50',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-500',
      Icon: Icons.Package
    };
  }
  if (name.includes('wrench') || name.includes('tool') || name.includes('setting')) {
    return {
      bg: 'bg-purple-50 border-purple-100/50',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
      Icon: Icons.Wrench
    };
  }
  if (name.includes('zap') || name.includes('bolt') || name.includes('cpu') || name.includes('charge')) {
    return {
      bg: 'bg-emerald-50 border-emerald-100/50',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-[#4c8c6f]',
      Icon: Icons.Zap
    };
  }
  // Default fallback
  return {
    bg: 'bg-gray-50 border-gray-100',
    iconBg: 'bg-gray-500/10',
    iconColor: 'text-gray-500',
    Icon: Icons.ShoppingBag
  };
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [catRes, priceRes] = await Promise.all([
        api.get('/categories'),
        api.get('/prices')
      ]);
      setCategories(catRes.data.categories || []);
      setPrices(priceRes.data.prices || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
      if (err.response?.status === 403) {
        navigate('/kyc');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-[#f4f6f5] min-h-screen">
        <Loader size="large" />
      </div>
    );
  }

  // Filter prices and categories locally based on search query
  const filteredPrices = prices.filter(p => 
    p.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.city && p.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 fade-in pb-16">
      
      {/* 1. Header Greeting Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-gray-200/60 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" 
            alt="User profile avatar" 
            className="h-14 w-14 rounded-full border-2 border-emerald-500/20 shadow-sm object-cover"
          />
          <div>
            <span className="text-xs text-gray-400 font-semibold tracking-wide block">Welcome back,</span>
            <h1 className="text-xl font-extrabold text-[#1e293b] tracking-tight leading-none mt-1 capitalize">
              {user?.name ? user.name.toLowerCase() : 'user'}
            </h1>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto md:min-w-[400px]">
          <div className="flex-1 bg-gray-50 border border-gray-150 rounded-2xl px-4 py-3 flex items-center gap-3 focus-within:ring-2 focus-within:ring-emerald-500/10 focus-within:border-[#4c8c6f] transition-all">
            <Icons.Search className="h-5 w-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search materials, sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-semibold text-gray-600 focus:outline-none placeholder-gray-400 bg-transparent"
            />
          </div>
          <button className="h-12 w-12 bg-white border border-gray-200 flex items-center justify-center rounded-2xl shadow-sm hover:bg-gray-50 active:scale-[0.95] transition-all">
            <Icons.SlidersHorizontal className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </header>

      {/* 2. Live Indicative Prices Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-extrabold text-[#1e293b] tracking-tight flex items-center gap-2">
            <Icons.TrendingUp className="h-4.5 w-4.5 text-[#4c8c6f]" />
            <span>Live indicative Prices</span>
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 px-3.5 py-1.5 rounded-xl shadow-sm">
            <Icons.MapPin className="h-3.5 w-3.5 text-[#4c8c6f]" />
            <span>Mumbai</span>
          </div>
        </div>

        {filteredPrices.length === 0 ? (
          <div className="p-12 text-center bg-white border border-gray-150 rounded-3xl text-xs text-gray-400 font-semibold shadow-sm">
            No live prices match search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {filteredPrices.map((p) => (
              <div 
                key={p._id}
                className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start gap-1">
                  <h4 className="text-sm font-extrabold text-[#1e293b] line-clamp-1 leading-tight">{p.materialName}</h4>
                  {getPercentChangePill(p)}
                </div>

                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="text-xl font-black text-[#1e293b]">₹{p.pricePerKg}</span>
                    <span className="text-xs text-gray-400 font-medium ml-1">/ kg</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium block mt-1.5">
                    {timeAgo(p.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. AI Material ID Banner */}
      <section>
        <div className="bg-[#4d866a] text-white p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 z-10 max-w-xl">
            <h4 className="text-lg font-extrabold tracking-tight">AI Material ID</h4>
            <p className="text-xs text-white/95 leading-relaxed font-medium">
              Upload a photo to instantly identify recyclable materials, analyze purity, and generate real-time market valuation estimates.
            </p>
            <button className="bg-white text-[#4d866a] font-extrabold text-xs py-2.5 px-5 rounded-xl flex items-center gap-2 mt-4 hover:bg-gray-50 active:scale-[0.98] transition-all shadow-sm">
              <Icons.Upload className="h-4 w-4" />
              <span>Upload Photo</span>
            </button>
          </div>

          <div className="bg-white/10 p-5 rounded-full border border-white/10 z-10 flex items-center justify-center self-start md:self-auto">
            <Icons.Cpu className="h-10 w-10 text-white/90" />
          </div>
        </div>
      </section>

      {/* 4. Categories Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-extrabold text-[#1e293b] tracking-tight">Categories</h3>
          <button className="text-xs font-extrabold text-[#4c8c6f] hover:underline bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
            View All
          </button>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center bg-white border border-gray-150 rounded-3xl text-xs text-gray-400 font-semibold shadow-sm">
            No categories match search query.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredCategories.map((c) => {
              const theme = getCategoryStyle(c.icon);
              return (
                <div 
                  key={c._id}
                  className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm text-center flex flex-col items-center hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-300 transition-all duration-300 cursor-pointer group"
                >
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-4 ${theme.iconBg}`}>
                    <theme.Icon className={`h-6 w-6 ${theme.iconColor}`} />
                  </div>
                  <h4 className="text-sm font-extrabold text-[#1e293b] group-hover:text-[#4c8c6f] transition-colors">{c.name}</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1.5 truncate w-full">{c.description || 'All items'}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Sticky Bottom Navigation Bar (Visible only on mobile) */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-30 md:hidden shadow-lg">
        <button className="flex flex-col items-center gap-1 text-[#4c8c6f] font-bold">
          <Icons.Home className="h-5 w-5" />
          <span className="text-[8px]">Home</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 font-bold transition-colors">
          <Icons.Tag className="h-5 w-5" />
          <span className="text-[8px]">Prices</span>
        </button>

        {/* Center floating Camera Button */}
        <div className="relative -mt-6">
          <button className="h-12 w-12 bg-[#4c8c6f] text-white flex items-center justify-center rounded-full shadow-lg shadow-emerald-700/20 hover:bg-[#3f755c] active:scale-[0.93] transition-all border-4 border-white">
            <Icons.Camera className="h-5 w-5" />
          </button>
        </div>

        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 font-bold transition-colors">
          <Icons.FileText className="h-5 w-5" />
          <span className="text-[8px]">Requests</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 font-bold transition-colors">
          <Icons.User className="h-5 w-5" />
          <span className="text-[8px]">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default Dashboard;
