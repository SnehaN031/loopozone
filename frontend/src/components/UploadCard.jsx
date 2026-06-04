import React from 'react';
import StatusBadge from './StatusBadge';
import { ArrowRight, CheckCircle, FileText, Camera } from 'lucide-react';

const UploadCard = ({ title, status, description, onUpload, isRejected = false }) => {
  const isDone = (status === 'verified' || status === 'under_review') && !isRejected;
  const isSelfie = title.toLowerCase().includes('selfie');

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            {isSelfie ? <Camera className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
          </div>
          <StatusBadge status={status} />
        </div>
        <h3 className="text-lg font-bold text-darkText mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{description}</p>
      </div>

      <button
        onClick={onUpload}
        disabled={isDone}
        className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
          isDone
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-primary hover:bg-primary-dark text-white hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98]'
        }`}
      >
        {isDone ? (
          <>
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <span>Uploaded</span>
          </>
        ) : (
          <>
            <span>
              {isRejected && (status === 'verified' || status === 'under_review')
                ? (isSelfie ? 'Re-capture Selfie' : 'Re-upload / Overwrite')
                : (isSelfie ? 'Capture Selfie' : 'Upload Document')}
            </span>
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
};

const LoaderSmall = () => (
  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
);

export default UploadCard;
