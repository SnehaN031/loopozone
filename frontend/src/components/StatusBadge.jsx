import React from 'react';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      classes: 'bg-gray-100 text-gray-800 border-gray-200'
    },
    under_review: {
      label: 'Uploaded',
      classes: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    verified: {
      label: 'Uploaded',
      classes: 'bg-emerald-100 text-emerald-800 border-emerald-200'
    },
    rejected: {
      label: 'Rejected',
      classes: 'bg-rose-100 text-rose-800 border-rose-200'
    }
  };

  const normalized = (status || 'pending').toLowerCase().replace(' ', '_');
  const config = statusConfig[normalized] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${config.classes}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {config.label}
    </span>
  );
};

export default StatusBadge;
