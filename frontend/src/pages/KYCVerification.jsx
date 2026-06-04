import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import UploadCard from '../components/UploadCard';
import Loader from '../components/Loader';
import { FileCheck, Award, CreditCard, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const KYCVerification = () => {
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'billing'
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchKycStatus();
  }, []);

  const { documents = {} } = statusData || {};
  const { aadhaar = 'pending', gst = 'pending', pan = 'pending', selfie = 'pending' } = documents;
  const isBusiness = statusData?.sellerType === 'business';
  const allVerified = statusData &&
                      aadhaar === 'verified' && 
                      pan === 'verified' && 
                      selfie === 'verified' && 
                      gst === 'verified';

  useEffect(() => {
    if (statusData && allVerified && (statusData.kycStatus === 'pending' || statusData.kycStatus === 'in_progress' || statusData.kycStatus === 'pending_review')) {
      setShowSuccessModal(true);
    }
  }, [statusData, allVerified]);

  const fetchKycStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get('/kyc/status');
      setStatusData(res.data);
    } catch (err) {
      toast.error('Failed to load KYC status data');
    } finally {
      setLoading(false);
    }
  };

  const handleSellerTypeChange = async (type) => {
    try {
      setLoading(true);
      await api.post('/kyc/seller-type', { sellerType: type });
      toast.success(`Switched account type to ${type === 'business' ? 'Business' : 'Individual'}`);
      await fetchKycStatus();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update account type');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      setLoading(true);
      const res = await api.post('/kyc/submit');
      toast.success(
        'Your documents have been successfully uploaded and moved to KYC verification. Please wait until admin approval.',
        { duration: 6000 }
      );
      updateProfile({ kycStatus: res.data.kycStatus, isKycVerified: false });
      navigate('/kyc/pending');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit KYC documents');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Introduction Card */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-darkText tracking-tight">Complete Onboarding</h1>
          <p className="text-sm text-gray-500 max-w-lg">
            To comply with Reserve Bank of India (RBI) regulations and activate your account, please complete your profile identity verification.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 text-primary px-5 py-3 rounded-2xl self-start md:self-auto">
          <Award className="h-6 w-6" />
          <div className="text-xs">
            <p className="font-bold text-darkText">Level 1 Gated</p>
            <p className="text-gray-500">Security Encrypted</p>
          </div>
        </div>
      </div>

      {/* Seller Type Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-darkText">Account Category</h3>
          <p className="text-xs text-gray-400">Choose between Individual user or Business seller profile.</p>
        </div>
        <div className="flex p-1.5 bg-gray-100/80 rounded-2xl border border-gray-100 gap-1 self-start sm:self-auto">
          <button
            onClick={() => handleSellerTypeChange('individual')}
            disabled={statusData?.isKycVerified}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              !isBusiness
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-400 hover:text-gray-600 disabled:opacity-50'
            }`}
          >
            Individual Seller
          </button>
          <button
            onClick={() => handleSellerTypeChange('business')}
            disabled={statusData?.isKycVerified}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${
              isBusiness
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-400 hover:text-gray-600 disabled:opacity-50'
            }`}
          >
            Business Seller
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-4 text-sm font-bold border-b-2 px-1 transition-all duration-200 ${
            activeTab === 'documents'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          KYC Documents
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`pb-4 text-sm font-bold border-b-2 px-1 transition-all duration-200 ${
            activeTab === 'billing'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Payout/Billing
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'documents' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UploadCard
              title="Aadhaar Verification"
              status={aadhaar}
              description="Verify your identity details via government OTP registry validation"
              onUpload={() => navigate('/kyc/aadhaar')}
              isRejected={statusData?.kycStatus === 'REJECTED'}
            />
            <UploadCard
              title="PAN Verification"
              status={pan}
              description="Extract details and run matching via Sandbox OCR & NSDL verify API"
              onUpload={() => navigate('/kyc/pan')}
              isRejected={statusData?.kycStatus === 'REJECTED'}
            />
            <UploadCard
              title="GST Verification"
              status={gst}
              description="Scanned copy of Goods and Services Tax (GST) Certificate"
              onUpload={() => navigate('/kyc/gst')}
              isRejected={statusData?.kycStatus === 'REJECTED'}
            />
            <UploadCard
              title="Selfie Upload"
              status={selfie}
              description="A clear live capture of your face to match with documentation"
              onUpload={() => navigate('/kyc/selfie')}
              isRejected={statusData?.kycStatus === 'REJECTED'}
            />
          </div>

          {/* Action Trigger Banner */}
          {allVerified && (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-xl text-white">
                  <FileCheck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-md font-bold text-darkText">All Documents Verified!</h4>
                  <p className="text-xs text-gray-500">Press continue to finalize and complete your onboarding process.</p>
                </div>
              </div>
              <button
                onClick={handleCompleteOnboarding}
                className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] transition-all duration-200"
              >
                Complete Onboarding
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm flex flex-col items-center justify-center text-center py-16">
          <div className="p-4 bg-gray-50 rounded-full border border-gray-200 mb-4 text-gray-400">
            <CreditCard className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-darkText mb-1">Payout Settings Gated</h3>
          <p className="text-sm text-gray-400 max-w-sm mb-6">
            Payout bank account settings can only be modified once Level-1 identity KYC verification is complete.
          </p>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-6">
          <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-8 w-full max-w-md animate-scale text-center space-y-6">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 bg-primary flex items-center justify-center rounded-2xl text-white font-extrabold text-lg mb-2 shadow-lg shadow-primary/20">
                L
              </div>
              <h3 className="text-xl font-extrabold text-darkText">Upload Complete</h3>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-1">Verification Processing</p>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed font-semibold px-2">
              You have successfully uploaded all the documents , please wait for admin approval 
            </p>

            <button
              onClick={handleCompleteOnboarding}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
            >
              Continue to Pending Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCVerification;
