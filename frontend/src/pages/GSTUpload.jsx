import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { UploadCloud, FileText, X, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const GSTUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      toast.error('File size exceeds the 5MB limit');
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Only JPG, PNG, and PDF files are allowed');
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview('pdf');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const cleanGst = gstNumber.toUpperCase().trim();
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(cleanGst)) {
      toast.error('Valid 15-digit GSTIN is required (e.g., 22AAAAA1111A1Z1)');
      return;
    }

    const formData = new FormData();
    formData.append('gst', file);
    formData.append('gstNumber', cleanGst);

    try {
      setLoading(true);
      await api.post('/kyc/gst/verify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('GST Certificate verified and uploaded successfully!');
      navigate('/kyc');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to verify or upload GST certificate';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/kyc')}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-primary transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to KYC Dashboard</span>
      </button>

      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
        <h2 className="text-xl font-bold text-darkText mb-1">GSTIN Certificate Verification</h2>
        <p className="text-sm text-gray-400 mb-6">Enter your 15-digit GSTIN number and upload a copy of your certificate.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              GSTIN Number
            </label>
            <input
              type="text"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
              placeholder="e.g. 22AAAAA1111A1Z1"
              maxLength={15}
              disabled={loading}
              className="block w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-semibold text-darkText uppercase placeholder:normal-case"
            />
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
            />

            {!file ? (
              <div className="text-center space-y-3">
                <div className="p-4 bg-primary/10 rounded-full text-primary inline-block">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <div className="text-sm font-semibold text-darkText">
                  Drag and drop file here, or <span className="text-primary hover:underline">browse</span>
                </div>
                <div className="text-xs text-gray-400">
                  Supported formats: JPG, PNG, PDF (Max size: 5MB)
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 relative">
                <div className="flex items-center gap-4">
                  {preview === 'pdf' ? (
                    <div className="p-3 bg-rose-100 rounded-xl text-rose-600">
                      <FileText className="h-6 w-6" />
                    </div>
                  ) : (
                    <img src={preview} alt="GST Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-bold text-darkText truncate max-w-[200px] sm:max-w-[300px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2.5 items-start bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-xs text-amber-800">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Ensure the GST certificate details are legible. The legal business name matching the GSTIN will be recorded inside your Loopozone vendor profile.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !file || !gstNumber}
            className="w-full py-4 px-4 bg-primary hover:bg-primary-dark disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/25 disabled:shadow-none hover:shadow-primary-dark/30 transition-all duration-300 active:scale-[0.98]"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Verify & Upload</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GSTUpload;
