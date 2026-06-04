import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, XCircle, User, Phone, Mail, Award, FileText } from 'lucide-react';
import Loader from '../components/Loader';

const AdminUserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('admin_token');
      if (!token) {
        toast.error('Session expired. Please log in again.');
        navigate('/admin/login');
        return;
      }

      const res = await api.get(`/admin/kyc/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load user details');
      navigate('/admin/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this user\'s KYC?')) return;

    try {
      setActionLoading(true);
      const token = sessionStorage.getItem('admin_token');
      const res = await api.post(`/admin/kyc/approve/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(res.data.message || 'KYC approved successfully');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error('Rejection reason is required');
      return;
    }

    if (reason.trim().length < 10) {
      toast.error('Please provide a detailed reason (minimum 10 characters)');
      return;
    }

    try {
      setActionLoading(true);
      const token = sessionStorage.getItem('admin_token');
      const res = await api.post(`/admin/kyc/reject/${userId}`, { reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(res.data.message || 'KYC rejected');
      setRejectModalOpen(false);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getDocUrl = (filePath) => {
    if (!filePath) return null;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const base = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${base}${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-lightBg flex justify-center items-center">
        <Loader size="large" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-lightBg p-8 text-center text-gray-500 font-bold">
        User records not found.
      </div>
    );
  }

  const isBusiness = user.sellerType === 'business';

  return (
    <div className="min-h-screen bg-lightBg flex flex-col font-sans pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-darkText transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600">
          <span>Reviewing Profile</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full p-8 space-y-8">
        {/* User Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-darkText tracking-tight">{user.name}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200 capitalize">
                {user.sellerType} Account
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-gray-400 font-semibold">
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={`text-[10px] uppercase font-extrabold px-3 py-1 rounded-full border text-center ${
              user.kycStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              user.kycStatus === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
              user.kycStatus === 'pending_review' ? 'bg-amber-50 text-amber-600 border-amber-100' :
              'bg-gray-100 text-gray-500 border-gray-200'
            }`}>
              {user.kycStatus === 'pending_review' ? 'Pending Review' : user.kycStatus}
            </span>
            <p className="text-[10px] text-gray-400 text-center font-bold">Reupload Count: {user.reuploadCount}</p>
          </div>
        </div>

        {/* Documents Auditing Panel */}
        <div className="space-y-6">
          <h3 className="text-md font-bold text-darkText flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            <span>Submitted Documentation</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aadhaar Details Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h4 className="text-sm font-bold text-darkText">Aadhaar Card Details</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${user.aadhaarVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {user.aadhaarVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="space-y-3 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span className="font-semibold">Masked Number</span>
                  <span className="font-bold text-darkText">{user.aadhaarNumber || 'N/A'}</span>
                </div>
                {user.aadhaarData && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-semibold">Name on Card</span>
                      <span className="font-bold text-darkText">{user.aadhaarData.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Date of Birth</span>
                      <span className="font-bold text-darkText">{user.aadhaarData.dob || user.aadhaarData.date_of_birth || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Gender</span>
                      <span className="font-bold text-darkText">{user.aadhaarData.gender || 'N/A'}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-50">
                      <span className="font-semibold block mb-1">Registered Address</span>
                      <p className="font-semibold text-darkText leading-relaxed italic">
                        {typeof user.aadhaarData.address === 'object' 
                          ? Object.values(user.aadhaarData.address).filter(Boolean).join(', ')
                          : user.aadhaarData.address || 'N/A'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Selfie Preview Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h4 className="text-sm font-bold text-darkText">Selfie Image</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${user.selfieImage ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                  {user.selfieImage ? 'Uploaded' : 'Missing'}
                </span>
              </div>
              <div className="h-44 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                {user.selfieImage ? (
                  <img
                    src={getDocUrl(user.selfieImage)}
                    alt="User Selfie"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400 font-semibold italic">No selfie captured</span>
                )}
              </div>
            </div>

            {/* PAN Verification Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h4 className="text-sm font-bold text-darkText">PAN Verification</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${user.panVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {user.panVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="space-y-3 text-xs text-gray-500 mb-4">
                <div className="flex justify-between">
                  <span className="font-semibold">PAN Number</span>
                  <span className="font-bold text-darkText">{user.panNumber || 'N/A'}</span>
                </div>
              </div>
              <div className="h-44 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                {user.panImage ? (
                  <img
                    src={getDocUrl(user.panImage)}
                    alt="PAN card uploaded"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400 font-semibold italic">No PAN image uploaded</span>
                )}
              </div>
            </div>

            {/* GST Details Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h4 className="text-sm font-bold text-darkText">GSTIN Document</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${user.gstVerified ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                  {user.gstVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              <div className="space-y-3 text-xs text-gray-500 mb-4">
                <div className="flex justify-between">
                  <span className="font-semibold">GSTIN Number</span>
                  <span className="font-bold text-darkText">{user.gstNumber || 'N/A'}</span>
                </div>
              </div>
              <div className="h-44 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center relative">
                {user.gstImage ? (
                  <img
                    src={getDocUrl(user.gstImage)}
                    alt="GST Certificate"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-gray-400 font-semibold italic">No GST certificate uploaded</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Auditing Actions Button Panel */}
        {user.kycStatus !== 'approved' && user.kycStatus !== 'verified' && !user.isKycVerified && (
          <div className="flex gap-4 pt-4 justify-end">
            <button
              onClick={() => setRejectModalOpen(true)}
              disabled={actionLoading}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/10 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              <span>Reject KYC</span>
            </button>
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/10 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Approve & Verify</span>
            </button>
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 w-full max-w-md animate-scale">
            <h3 className="text-lg font-extrabold text-darkText mb-2">Reject KYC Request</h3>
            <p className="text-xs text-gray-400 mb-4">Explain the document validation failure. Users will be asked to re-upload files based on this context.</p>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specify rejection details (minimum 10 characters, e.g. Selfie image blurry, PAN card cropped)"
                rows={4}
                className="w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 transition-all font-semibold"
              />

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRejectModalOpen(false);
                    setReason('');
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs py-2.5 px-4 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || reason.trim().length < 10}
                  className="bg-rose-600 hover:bg-rose-700 disabled:bg-gray-200 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserDetail;
