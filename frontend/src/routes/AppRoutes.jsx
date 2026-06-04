import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';

import Landing from '../pages/Landing';
import Login from '../pages/Login';
import OTPVerification from '../pages/OTPVerification';
import Signup from '../pages/Signup';
import KYCVerification from '../pages/KYCVerification';
import AadhaarUpload from '../pages/AadhaarUpload';
import GSTUpload from '../pages/GSTUpload';
import PANUpload from '../pages/PANUpload';
import SelfieUpload from '../pages/SelfieUpload';
import VerificationProcessing from '../pages/VerificationProcessing';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import EmailVerification from '../pages/EmailVerification';
import KYCPending from '../pages/KYCPending';
import KycRejected from '../pages/KycRejected';
import AdminLogin from '../pages/AdminLogin';
import AdminDashboard from '../pages/AdminDashboard';
import AdminUserDetail from '../pages/AdminUserDetail';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Admin Login Route */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Standalone Protected Email & KYC Gating Routes */}
      <Route
        path="/verify-email"
        element={
          <ProtectedRoute>
            <EmailVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kyc/pending"
        element={
          <ProtectedRoute>
            <KYCPending />
          </ProtectedRoute>
        }
      />
      <Route
        path="/kyc/rejected"
        element={
          <ProtectedRoute>
            <KycRejected />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/user/:userId"
        element={
          <ProtectedRoute>
            <AdminUserDetail />
          </ProtectedRoute>
        }
      />
      {/* Auth/Public Screens wrapped in AuthLayout */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Protected Dashboard Screens */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/kyc" element={<KYCVerification />} />
        <Route path="/kyc/aadhaar" element={<AadhaarUpload />} />
        <Route path="/kyc/gst" element={<GSTUpload />} />
        <Route path="/kyc/pan" element={<PANUpload />} />
        <Route path="/kyc/selfie" element={<SelfieUpload />} />
        <Route path="/kyc/processing" element={<VerificationProcessing />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
