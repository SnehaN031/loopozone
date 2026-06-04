import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Camera, RefreshCw, AlertCircle, ArrowLeft, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const SelfieUpload = () => {
  const [stream, setStream] = useState(null);
  const [imgData, setImgData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 480, facingMode: 'user' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraError(true);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = 400;
    canvas.height = 400;
    context.drawImage(video, 0, 0, 400, 400);
    
    const dataUrl = canvas.toDataURL('image/jpeg');
    setImgData(dataUrl);
    stopCamera();
  };

  const handleFileFallback = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgData(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const retakePhoto = () => {
    setImgData(null);
    startCamera();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imgData) {
      toast.error('No capture found to upload');
      return;
    }

    try {
      setLoading(true);
      const imageRes = await fetch(imgData);
      const blob = await imageRes.blob();
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('selfie', file);

      const response = await api.post('/kyc/selfie', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Selfie uploaded successfully!');
      navigate('/kyc');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to upload selfie';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => {
          stopCamera();
          navigate('/kyc');
        }}
        className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-primary transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to KYC Dashboard</span>
      </button>

      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm text-center">
        <h2 className="text-xl font-bold text-darkText mb-1">Selfie Verification</h2>
        <p className="text-sm text-gray-400 mb-8">Ensure your face is clearly visible in well-lit conditions.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative mx-auto w-64 h-64 rounded-full overflow-hidden border-4 border-gray-200 shadow-inner flex items-center justify-center bg-gray-50">
            {cameraActive && !imgData && (
              <video
                ref={videoRef}
                className="w-full h-full object-cover scale-x-[-1]"
                muted
                playsInline
              />
            )}

            {imgData && (
              <img
                src={imgData}
                alt="Captured Face"
                className="w-full h-full object-cover"
              />
            )}

            {cameraError && !imgData && (
              <div className="p-6 text-center space-y-2">
                <AlertCircle className="h-8 w-8 text-rose-500 mx-auto animate-pulse" />
                <p className="text-xs text-gray-500">Camera access disabled or unsupported.</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Choose Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileFallback}
                  className="hidden"
                />
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex justify-center gap-4">
            {cameraActive && !imgData && (
              <button
                type="button"
                onClick={capturePhoto}
                className="inline-flex items-center gap-2 py-3 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
              >
                <Camera className="h-5 w-5" />
                <span>Capture Frame</span>
              </button>
            )}

            {imgData && (
              <>
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="inline-flex items-center gap-2 py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl active:scale-[0.98] transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Retake</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 py-3 px-6 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Submit Photo</span>
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelfieUpload;
