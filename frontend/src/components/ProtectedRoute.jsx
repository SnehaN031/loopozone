import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-lightBg">
        <Loader size="large" />
      </div>
    );
  }

  // 1. ADMIN Route Gating
  if (location.pathname.startsWith('/admin')) {
    if (location.pathname === '/admin/login') {
      return children;
    }
    const adminToken = sessionStorage.getItem('admin_token');
    if (!adminToken) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  }

  // 2. USER Authentication Gating
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Email Gating
  if (!user?.isEmailVerified) {
    if (location.pathname !== '/verify-email') {
      return <Navigate to="/verify-email" replace />;
    }
    return children;
  }

  if (user?.isEmailVerified && location.pathname === '/verify-email') {
    if (user?.kycStatus === 'approved' || user?.isKycVerified) {
      return <Navigate to="/dashboard" replace />;
    } else if (user?.kycStatus === 'pending_review') {
      return <Navigate to="/kyc/pending" replace />;
    } else if (user?.kycStatus === 'rejected') {
      return <Navigate to="/kyc/rejected" replace />;
    } else {
      return <Navigate to="/kyc" replace />;
    }
  }

  // 4. KYC Status Gating
  const isKycPath = location.pathname.startsWith('/kyc');

  if (user?.kycStatus === 'pending_review') {
    if (location.pathname !== '/kyc/pending') {
      return <Navigate to="/kyc/pending" replace />;
    }
  } else if (user?.kycStatus === 'rejected') {
    const allowedForRejected = isKycPath && location.pathname !== '/kyc/pending';
    if (!allowedForRejected) {
      return <Navigate to="/kyc/rejected" replace />;
    }
  } else if (user?.kycStatus === 'approved' || user?.isKycVerified) {
    if (isKycPath) {
      return <Navigate to="/dashboard" replace />;
    }
  } else {
    // pending or in_progress
    const allowedForUploading = isKycPath && location.pathname !== '/kyc/pending' && location.pathname !== '/kyc/rejected';
    if (!allowedForUploading) {
      return <Navigate to="/kyc" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
