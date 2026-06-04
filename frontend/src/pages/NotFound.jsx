import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col justify-center items-center text-center space-y-4 fade-in">
      <div className="p-4 bg-gray-100 border border-gray-200 rounded-full text-gray-400">
        <HelpCircle className="h-10 w-10" />
      </div>
      <h2 className="text-xl font-bold text-darkText">Page Not Found</h2>
      <p className="text-sm text-gray-400 max-w-xs">
        The route you are trying to visit does not exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        className="text-xs bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-xl transition-all duration-200 active:scale-[0.98]"
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
