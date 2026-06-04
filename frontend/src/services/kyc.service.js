import { apiForm, apiJson } from './client.service';

export function sendAadhaarOtp(aadhaarNumber) {
  return apiJson('/kyc/aadhaar/send-otp', {
    method: 'POST',
    body: {
      aadhaarNumber: normalizeAadhaar(aadhaarNumber),
    },
  });
}

export function verifyAadhaarOtp({ aadhaarNumber, otp, referenceId }) {
  return apiJson('/kyc/aadhaar/verify-otp', {
    method: 'POST',
    body: {
      aadhaarNumber: normalizeAadhaar(aadhaarNumber),
      otp,
      referenceId,
    },
  });
}

export function verifyPanCard({ pan, panImage, extractedPan }) {
  const formData = new FormData();
  formData.append('pan', pan.trim().toUpperCase());
  formData.append('panImage', panImage);

  if (extractedPan) {
    formData.append('extractedPan', extractedPan);
  }

  return apiForm('/kyc/pan/verify', formData);
}

export function verifyGstCertificate({ gstNumber, gstCertificate, extractedGst }) {
  const formData = new FormData();
  const normalizedGstNumber = gstNumber.trim().toUpperCase();

  formData.append('gstNumber', normalizedGstNumber);
  formData.append('gstin', normalizedGstNumber);
  formData.append('gst', gstCertificate);

  if (extractedGst) {
    formData.append('extractedGst', extractedGst);
  }

  return apiForm('/kyc/gst/verify', formData);
}

export function uploadSelfie(selfie) {
  const formData = new FormData();
  formData.append('selfie', selfie);

  return apiForm('/kyc/selfie', formData);
}

export function getKycStatus() {
  return apiJson('/kyc/status');
}

export function setSellerType(sellerType) {
  return apiJson('/kyc/seller-type', {
    method: 'POST',
    body: {
      sellerType,
    },
  });
}

export function submitKycForReview() {
  return apiJson('/kyc/submit', {
    method: 'POST',
  });
}

function normalizeAadhaar(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 12);
}
