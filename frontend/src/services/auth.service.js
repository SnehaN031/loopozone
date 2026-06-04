import { apiJson, formatIndianPhone } from './client.service';

export function checkUser(phone) {
  return apiJson('/auth/check-user', {
    method: 'POST',
    body: {
      phone: formatIndianPhone(phone),
    },
  });
}

export function checkUserByEmail(email) {
  return apiJson('/auth/check-user', {
    method: 'POST',
    body: {
      email: normalizeEmail(email),
    },
  });
}

export function signupUser({ name, email, phone, sellerType }) {
  return apiJson('/auth/signup', {
    method: 'POST',
    body: {
      name,
      email,
      phone: formatIndianPhone(phone),
      sellerType,
    },
  });
}

export function sendLoginOtp(phone) {
  return apiJson('/auth/send-otp', {
    method: 'POST',
    body: {
      phone: formatIndianPhone(phone),
    },
  });
}

export function sendEmailLoginOtp({ email, phone }) {
  return apiJson('/auth/send-email-otp', {
    method: 'POST',
    body: {
      email: normalizeEmail(email),
      phone: formatIndianPhone(phone),
    },
  });
}

export function verifyLoginOtp({ phone, otp }) {
  return apiJson('/auth/verify-otp', {
    method: 'POST',
    body: {
      phone: formatIndianPhone(phone),
      otp,
    },
  });
}

export function verifyEmailLoginOtp({ email, phone, otp }) {
  return apiJson('/auth/verify-email-otp', {
    method: 'POST',
    body: {
      email: normalizeEmail(email),
      phone: formatIndianPhone(phone),
      otp,
    },
  });
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}
