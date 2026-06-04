import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Brand Logo */}
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none active:scale-[0.98] transition-all duration-200"
        >
          <div className="h-9 w-9 bg-primary flex items-center justify-center rounded-xl text-white font-extrabold shadow-md shadow-primary/20">
            L
          </div>
          <span className="text-xl font-extrabold tracking-tight text-darkText">
            Loopozone
          </span>
        </div>

        {/* User Profile Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-sm font-semibold text-darkText leading-none mb-1">
              {user?.name || 'Onboarding User'}
            </span>
            <span className="text-xs text-gray-400">
              {user?.phone || ''}
            </span>
          </div>

          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 border border-gray-200">
            <User className="h-5 w-5" />
          </div>

          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-rose-50 rounded-xl transition-all duration-300 active:scale-[0.95]"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
