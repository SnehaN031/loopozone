const USER_KEY = 'loopozone_auth_user';
const SESSION_KEY = 'loopozone_has_auth_session';
const TOKEN_KEY = 'loopozone_auth_token';
const REFRESH_TOKEN_KEY = 'loopozone_refresh_token';
export const SIGNUP_DRAFT_KEY = 'loopozone_signup_draft';

export function formatIndianPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  const withoutCountryCode = digits.startsWith('91') && digits.length > 10 ? digits.slice(2) : digits;
  return `+91${withoutCountryCode.slice(-10)}`;
}

export function getIndianPhoneInputValue(value) {
  const digits = String(value || '').replace(/\D/g, '');
  const withoutCountryCode = digits.startsWith('91') && digits.length > 10 ? digits.slice(2) : digits;
  return withoutCountryCode.slice(0, 10);
}

export function isValidIndianPhone(value) {
  return /^\+91[6-9]\d{9}$/.test(formatIndianPhone(value));
}

export function setAuthSession(session = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const token = getAuthToken(session);
  const refreshToken = getRefreshToken(session);
  const user = getSessionUser(session);

  if (token || refreshToken || user) {
    sessionStorage.setItem(SESSION_KEY, 'true');
  }

  if (token) {
    localStorage.setItem(TOKEN_KEY, normalizeAccessToken(token));
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  if (user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function storeAuthTokens(session = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const token = getAuthToken(session);
  const refreshToken = getRefreshToken(session);

  if (token) {
    localStorage.setItem(TOKEN_KEY, normalizeAccessToken(token));
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function getAuthTokens(session = {}) {
  return {
    token: getAuthToken(session),
    refreshToken: getRefreshToken(session),
  };
}

export function getStoredAccessToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  migrateSessionTokensToLocalStorage();

  return normalizeAccessToken(localStorage.getItem(TOKEN_KEY));
}

export function getStoredRefreshToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  migrateSessionTokensToLocalStorage();

  return localStorage.getItem(REFRESH_TOKEN_KEY) || '';
}

export function hasAuthSession() {
  if (typeof window === 'undefined') {
    return false;
  }

  return sessionStorage.getItem(SESSION_KEY) === 'true';
}

export function clearAuthSession() {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function saveSignupDraft(draft) {
  if (typeof window === 'undefined') {
    return;
  }

  sessionStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(draft));
}

export function getSignupDraft() {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedDraft = sessionStorage.getItem(SIGNUP_DRAFT_KEY);

  if (!storedDraft) {
    return null;
  }

  try {
    return JSON.parse(storedDraft);
  } catch {
    sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
    return null;
  }
}

export async function apiJson(path, { method = 'GET', body, headers: requestHeaders = {} } = {}) {
  const headers = {
    Accept: 'application/json',
    ...requestHeaders,
  };

  attachStoredAuthToken(path, headers);

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  return apiFetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiForm(path, formData, { method = 'POST', headers: requestHeaders = {} } = {}) {
  const headers = {
    Accept: 'application/json',
    ...requestHeaders,
  };

  attachStoredAuthToken(path, headers);

  return apiFetch(path, {
    method,
    headers,
    body: formData,
  });
}

async function apiFetch(path, options) {
  let response;

  try {
    response = await fetch(`/api${path}`, {
      ...options,
      credentials: 'include',
    });
  } catch {
    throw buildClientError('Service is temporarily unavailable. Please try again shortly.');
  }

  const payload = await parseResponse(response);

  if (response.ok && payload && typeof payload === 'object') {
    storeAuthTokens(payload);
  }

  if (response.status === 401 && shouldClearClientSessionOnUnauthorized(path)) {
    clearAuthSession();
  }

  if (!response.ok || payload?.success === false) {
    throw buildApiError(response, payload);
  }

  return payload;
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { success: false, error: text };
  }
}

function buildApiError(response, payload) {
  const error = new Error(getSafeApiErrorMessage(response, payload));
  error.status = response.status;
  error.payload = payload;
  return error;
}

function buildClientError(message) {
  const error = new Error(message);
  error.status = 0;
  return error;
}

function attachStoredAuthToken(path, headers) {
  if (typeof window === 'undefined') {
    return;
  }

  migrateSessionTokensToLocalStorage();

  const token = getStoredAccessToken();
  const refreshToken = getStoredRefreshToken();

  if (path === '/auth/refresh-token') {
    if (refreshToken && !headers['X-Refresh-Token']) {
      headers['X-Refresh-Token'] = refreshToken;
    }

    return;
  }

  if (isPublicWithoutAccessTokenEndpoint(path)) {
    return;
  }

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }
}

function migrateSessionTokensToLocalStorage() {
  const sessionToken = normalizeAccessToken(sessionStorage.getItem(TOKEN_KEY));
  const sessionRefreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY);

  if (sessionToken && !localStorage.getItem(TOKEN_KEY)) {
    localStorage.setItem(TOKEN_KEY, sessionToken);
  }

  if (sessionRefreshToken && !localStorage.getItem(REFRESH_TOKEN_KEY)) {
    localStorage.setItem(REFRESH_TOKEN_KEY, sessionRefreshToken);
  }

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

function normalizeAccessToken(value = '') {
  return String(value || '').trim().replace(/^Bearer\s+/i, '');
}

function getAuthToken(session = {}) {
  return normalizeAccessToken(
    session.token ||
      session.accessToken ||
      session.access_token ||
      session.jwt ||
      session.authToken ||
      session.bearerToken ||
      session.data?.token ||
      session.data?.accessToken ||
      session.data?.access_token ||
      session.data?.tokens?.token ||
      session.data?.tokens?.access ||
      session.data?.tokens?.accessToken ||
      session.data?.tokens?.access_token ||
      session.data?.access ||
      session.data?.access?.token ||
      session.tokens?.token ||
      session.tokens?.access ||
      session.tokens?.accessToken ||
      session.tokens?.access_token ||
      session.tokens?.access?.token ||
      session.access?.token ||
      session.user?.token ||
      session.user?.access ||
      session.user?.accessToken ||
      session.user?.access_token
  );
}

function getRefreshToken(session = {}) {
  return (
    session.refreshToken ||
    session.refresh_token ||
    session.data?.refreshToken ||
    session.data?.refresh_token ||
    session.data?.tokens?.refreshToken ||
    session.data?.tokens?.refresh_token ||
    session.data?.tokens?.refresh ||
    session.data?.tokens?.refresh?.token ||
    session.data?.refresh?.token ||
    session.tokens?.refreshToken ||
    session.tokens?.refresh_token ||
    session.tokens?.refresh ||
    session.tokens?.refresh?.token ||
    session.refresh?.token ||
    session.user?.refreshToken ||
    session.user?.refresh_token ||
    ''
  );
}

function getSessionUser(session = {}) {
  return session.user || session.data?.user || session.data?.profile || session.profile || null;
}

function shouldClearClientSessionOnUnauthorized(path) {
  const sessionPreservingEndpoints = new Set([
    '/auth/send-otp',
    '/auth/verify-otp',
    '/auth/send-email-otp',
    '/auth/verify-email-otp',
    '/auth/refresh-token',
    '/kyc/selfie',
  ]);

  return !sessionPreservingEndpoints.has(path);
}

function isPublicWithoutAccessTokenEndpoint(path) {
  return new Set([
    '/auth/check-user',
    '/auth/signup',
  ]).has(path);
}

function getSafeApiErrorMessage(response, payload) {
  const message = String(payload?.error || payload?.message || '').trim();

  if (!message || containsOperationalDetails(message)) {
    return 'Something went wrong. Please try again.';
  }

  if (response.status >= 500) {
    return message;
  }

  return message;
}

function containsOperationalDetails(message) {
  return /backend|server|database|jwt|token|stack|exception|trace|localhost|env|configured|running/i.test(message);
}
