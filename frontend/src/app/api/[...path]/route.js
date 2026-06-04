import { NextResponse } from 'next/server';

const AUTH_COOKIE = 'loz_token';
const REFRESH_AUTH_COOKIE = 'loz_refresh_token';
const BACKEND_API_URL = normalizeBackendApiUrl(process.env.LOOPOZONE_API_URL);

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
  return proxyRequest(request, context);
}

export async function POST(request, context) {
  return proxyRequest(request, context);
}

export async function PUT(request, context) {
  return proxyRequest(request, context);
}

export async function PATCH(request, context) {
  return proxyRequest(request, context);
}

export async function DELETE(request, context) {
  return proxyRequest(request, context);
}

async function proxyRequest(request, { params }) {
  if (!BACKEND_API_URL) {
    return NextResponse.json(
      { success: false, error: 'Service is temporarily unavailable. Please try again shortly.' },
      { status: 500 }
    );
  }

  const backendPath = `/${(params.path || []).join('/')}`;
  const headers = new Headers({ Accept: 'application/json' });
  const token = request.cookies.get(AUTH_COOKIE)?.value || normalizeBearerToken(request.headers.get('authorization'));
  const refreshToken = request.cookies.get(REFRESH_AUTH_COOKIE)?.value || getStringValue(request.headers.get('x-refresh-token'));
  const init = {
    method: request.method,
    headers,
    cache: 'no-store',
  };

  if (token && shouldAttachAuthToken(backendPath)) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (refreshToken && shouldAttachRefreshToken(backendPath)) {
    headers.set('X-Refresh-Token', refreshToken);
  }

  if (!['GET', 'HEAD'].includes(request.method)) {
    await attachRequestBody(request, init, headers);
  }

  let backendResponse;

  try {
    backendResponse = await fetchBackendPath(backendPath, request.nextUrl.search, init);
  } catch (error) {
    console.error(`Backend API request failed for ${backendPath}:`, error);

    return NextResponse.json(
      {
        success: false,
        error: getConnectionErrorMessage(backendPath),
      },
      { status: 502 }
    );
  }

  const responseText = await backendResponse.text();
  const retryResponse = await retryApiPrefixedRouteOnMissingEndpoint({
    backendPath,
    init,
    originalStatus: backendResponse.status,
    requestSearch: request.nextUrl.search,
    responseText,
  });

  if (retryResponse) {
    backendResponse = retryResponse.response;
  }

  let finalResponseText = retryResponse?.responseText ?? responseText;
  const refreshedRequest = await retryWithRefreshedAuthToken({
    backendPath,
    init,
    refreshToken,
    requestSearch: request.nextUrl.search,
    status: backendResponse.status,
  });

  if (refreshedRequest) {
    backendResponse = refreshedRequest.response;
    finalResponseText = refreshedRequest.responseText;
  }

  const payload = parseJson(finalResponseText);
  const normalizedResponse = normalizeVerifyOtpResponse(backendPath, backendResponse.status, payload);

  if (normalizedResponse) {
    backendResponse = {
      status: normalizedResponse.status,
      headers: backendResponse.headers,
    };
  }

  const authToken = getResponseAuthToken(backendResponse.headers) || getPayloadAuthToken(payload) || refreshedRequest?.token || '';
  const responseRefreshToken =
    getResponseRefreshToken(backendResponse.headers) || getPayloadRefreshToken(payload) || refreshedRequest?.refreshToken || '';
  const responsePayload = sanitizeOtpResponsePayload(
    normalizedResponse?.payload || (payload && typeof payload === 'object' ? { ...payload } : payload),
    backendPath
  );

  if (responsePayload && typeof responsePayload === 'object') {
    if (!isAuthTokenEndpoint(backendPath)) {
      stripAuthTokens(responsePayload);
    }

    if (authToken && isAuthTokenEndpoint(backendPath)) {
      responsePayload.token = authToken;
    }

    if (responseRefreshToken && isAuthTokenEndpoint(backendPath)) {
      responsePayload.refreshToken = responseRefreshToken;
    }
  }

  const response = NextResponse.json(responsePayload ?? {}, { status: backendResponse.status });

  if (backendResponse.status === 401 && shouldClearAuthTokenOnUnauthorized(backendPath)) {
    response.cookies.delete(AUTH_COOKIE);
    response.cookies.delete(REFRESH_AUTH_COOKIE);
  }

  if (authToken && shouldPersistAuthToken(backendPath, refreshedRequest)) {
    response.cookies.set(AUTH_COOKIE, authToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  if (responseRefreshToken && shouldPersistAuthToken(backendPath, refreshedRequest)) {
    response.cookies.set(REFRESH_AUTH_COOKIE, responseRefreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

async function attachRequestBody(request, init, headers) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    init.body = await request.formData();
    return;
  }

  if (contentType.includes('application/json')) {
    headers.set('Content-Type', 'application/json');
    init.body = await request.text();
    return;
  }

  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  init.body = await request.arrayBuffer();
}

function parseJson(text) {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { success: false, error: text };
  }
}

async function retryApiPrefixedRouteOnMissingEndpoint({ backendPath, init, originalStatus, requestSearch, responseText }) {
  if (originalStatus !== 404 || backendPath.startsWith('/api/')) {
    return null;
  }

  const payload = parseJson(responseText);

  if (!isMissingRouteResponse(payload, responseText)) {
    return null;
  }

  const retryPaths = getMissingEndpointRetryPaths(backendPath);

  for (const retryPath of retryPaths) {
    const retryResponse = await fetchBackendPath(retryPath, requestSearch, cloneRequestInit(init));
    const retryResponseText = await retryResponse.text();

    if (retryResponse.status !== 404 || !isMissingRouteResponse(parseJson(retryResponseText), retryResponseText)) {
      return {
        response: retryResponse,
        responseText: retryResponseText,
      };
    }
  }

  return null;
}

async function retryWithRefreshedAuthToken({ backendPath, init, refreshToken, requestSearch, status }) {
  if (status !== 401 || !refreshToken || !shouldRetryWithRefreshToken(backendPath)) {
    return null;
  }

  const refreshResponse = await fetchBackendPath('/auth/refresh', '', {
    method: 'POST',
    headers: new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }),
    cache: 'no-store',
    body: JSON.stringify({ refreshToken }),
  });
  const refreshResponseText = await refreshResponse.text();
  const refreshPayload = parseJson(refreshResponseText);

  if (!refreshResponse.ok || refreshPayload?.success === false) {
    return null;
  }

  const token = getResponseAuthToken(refreshResponse.headers) || getPayloadAuthToken(refreshPayload);
  const nextRefreshToken = getResponseRefreshToken(refreshResponse.headers) || getPayloadRefreshToken(refreshPayload) || refreshToken;

  if (!token) {
    return null;
  }

  const retryInit = cloneRequestInit(init);
  retryInit.headers.set('Authorization', `Bearer ${token}`);

  if (nextRefreshToken) {
    retryInit.headers.set('X-Refresh-Token', nextRefreshToken);
  }

  const response = await fetchBackendPath(backendPath, requestSearch, retryInit);
  const responseText = await response.text();

  return {
    response,
    responseText,
    token,
    refreshToken: nextRefreshToken,
  };
}

function getMissingEndpointRetryPaths(path) {
  const apiPrefixedPath = `/api${path}`;

  if (path === '/auth/send-otp') {
    return [
      apiPrefixedPath,
      '/auth/generate-otp',
      '/api/auth/generate-otp',
      '/auth/request-otp',
      '/api/auth/request-otp',
      '/auth/otp/send',
      '/api/auth/otp/send',
    ];
  }

  if (path === '/auth/verify-otp') {
    return [
      apiPrefixedPath,
      '/auth/validate-otp',
      '/api/auth/validate-otp',
      '/auth/otp/verify',
      '/api/auth/otp/verify',
    ];
  }

  if (path === '/kyc/gst/verify') {
    return [
      apiPrefixedPath,
      '/kyc/verify-gst',
      '/api/kyc/verify-gst',
      '/kyc/gst',
      '/api/kyc/gst',
      '/kyc/gst/verify-certificate',
      '/api/kyc/gst/verify-certificate',
      '/kyc/gst-certificate/verify',
      '/api/kyc/gst-certificate/verify',
    ];
  }

  return [apiPrefixedPath];
}

function isMissingRouteResponse(payload, responseText) {
  const message = String(payload?.error || payload?.message || responseText || '').trim();

  if (/user|profile|kyc|document|record/i.test(message)) {
    return false;
  }

  return /cannot\s+(get|post|put|patch|delete)|route\s+not\s+found|endpoint\s+not\s+found|not\s+found/i.test(message);
}

function normalizeVerifyOtpResponse(path, status, payload) {
  if (path !== '/auth/verify-otp' || status !== 404 || !isVerifiedNewUserResponse(payload)) {
    return null;
  }

  return {
    status: 200,
    payload: {
      success: true,
      status: 'new_user',
      newUser: true,
      message: 'Mobile number verified.',
    },
  };
}

function isVerifiedNewUserResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const message = String(payload.error || payload.message || '').trim();

  if (/route\s+not\s+found|endpoint\s+not\s+found|cannot\s+(get|post|put|patch|delete)/i.test(message)) {
    return false;
  }

  return Boolean(
    payload.existingUser === false ||
      payload.newUser === true ||
      payload.status === 'new_user' ||
      /user|profile|not\s+registered/i.test(message)
  );
}

function cloneRequestInit(init) {
  return {
    ...init,
    headers: new Headers(init.headers),
  };
}

async function fetchBackendPath(path, search = '', init) {
  const urls = getBackendUrls(path, search);
  let lastError;

  for (const url of urls) {
    try {
      return await fetch(url, cloneRequestInit(init));
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

function getBackendUrls(path, search = '') {
  const primaryUrl = `${BACKEND_API_URL}${path}${search || ''}`;
  const urls = [primaryUrl];

  try {
    const parsedUrl = new URL(primaryUrl);

    if (parsedUrl.hostname === 'localhost') {
      parsedUrl.hostname = '127.0.0.1';
      urls.push(parsedUrl.toString());
    }
  } catch {
    return urls;
  }

  return urls;
}

function sanitizeOtpResponsePayload(payload, path) {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const otpEndpoints = new Set(['/auth/send-otp', '/auth/send-email-otp', '/kyc/aadhaar/send-otp']);

  if (!otpEndpoints.has(path)) {
    return payload;
  }

  const sanitized = { ...payload };

  delete sanitized.otp;
  delete sanitized.OTP;
  delete sanitized.code;
  delete sanitized.verificationCode;

  if (path === '/auth/send-otp') {
    if (sanitized.error) {
      sanitized.error = 'Unable to send OTP. Please try again.';
    } else if (sanitized.success !== false) {
      sanitized.message = 'OTP sent successfully.';
    }
  }

  if (path === '/auth/send-email-otp') {
    if (sanitized.error) {
      sanitized.error = 'Unable to send email OTP. Please try again.';
    } else if (sanitized.success !== false) {
      sanitized.message = 'OTP sent successfully.';
    }
  }

  if (path === '/kyc/aadhaar/send-otp') {
    if (sanitized.error) {
      sanitized.error = 'Unable to send Aadhaar OTP. Please try again.';
    } else if (sanitized.success !== false) {
      sanitized.message = 'Aadhaar OTP sent successfully.';
    }
  }

  return sanitized;
}

function getPayloadAuthToken(payload) {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  return (
    getStringValue(payload.token) ||
    getStringValue(payload.accessToken) ||
    getStringValue(payload.access_token) ||
    getStringValue(payload.jwt) ||
    getStringValue(payload.idToken) ||
    getStringValue(payload.authToken) ||
    getStringValue(payload.bearerToken) ||
    getStringValue(payload.data?.token) ||
    getStringValue(payload.data?.accessToken) ||
    getStringValue(payload.data?.access_token) ||
    getStringValue(payload.data?.jwt) ||
    getStringValue(payload.data?.idToken) ||
    getStringValue(payload.data?.authToken) ||
    getStringValue(payload.data?.bearerToken) ||
    getStringValue(payload.data?.tokens?.token) ||
    getStringValue(payload.data?.tokens?.access) ||
    getStringValue(payload.data?.tokens?.accessToken) ||
    getStringValue(payload.data?.tokens?.access_token) ||
    getStringValue(payload.data?.tokens?.access?.token) ||
    getStringValue(payload.data?.access) ||
    getStringValue(payload.tokens?.token) ||
    getStringValue(payload.tokens?.access) ||
    getStringValue(payload.tokens?.accessToken) ||
    getStringValue(payload.tokens?.access_token) ||
    getStringValue(payload.tokens?.access?.token) ||
    getStringValue(payload.access?.token) ||
    getStringValue(payload.data?.access?.token) ||
    getStringValue(payload.user?.token) ||
    getStringValue(payload.user?.access) ||
    getStringValue(payload.user?.accessToken) ||
    getStringValue(payload.user?.access_token) ||
    findTokenByKey(payload, new Set(['access', 'accessToken', 'access_token', 'authToken', 'bearerToken', 'idToken', 'jwt', 'token']))
  );
}

function getPayloadRefreshToken(payload) {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  return (
    getStringValue(payload.refreshToken) ||
    getStringValue(payload.refresh_token) ||
    getStringValue(payload.data?.refreshToken) ||
    getStringValue(payload.data?.refresh_token) ||
    getStringValue(payload.data?.tokens?.refreshToken) ||
    getStringValue(payload.data?.tokens?.refresh_token) ||
    getStringValue(payload.data?.tokens?.refresh) ||
    getStringValue(payload.data?.tokens?.refresh?.token) ||
    getStringValue(payload.tokens?.refreshToken) ||
    getStringValue(payload.tokens?.refresh_token) ||
    getStringValue(payload.tokens?.refresh) ||
    getStringValue(payload.tokens?.refresh?.token) ||
    getStringValue(payload.refresh?.token) ||
    getStringValue(payload.data?.refresh?.token) ||
    getStringValue(payload.user?.refreshToken) ||
    getStringValue(payload.user?.refresh_token) ||
    findTokenByKey(payload, new Set(['refresh', 'refreshToken', 'refresh_token']))
  );
}

function findTokenByKey(value, tokenKeys, seen = new WeakSet()) {
  if (!value || typeof value !== 'object') {
    return '';
  }

  if (seen.has(value)) {
    return '';
  }

  seen.add(value);

  for (const [key, nestedValue] of Object.entries(value)) {
    if (tokenKeys.has(key)) {
      const token = getStringValue(nestedValue);

      if (token) {
        return token;
      }
    }

    const nestedToken = findTokenByKey(nestedValue, tokenKeys, seen);

    if (nestedToken) {
      return nestedToken;
    }
  }

  return '';
}

function getResponseAuthToken(headers) {
  return (
    normalizeBearerToken(headers.get('authorization')) ||
    normalizeBearerToken(headers.get('x-access-token')) ||
    normalizeBearerToken(headers.get('x-auth-token'))
  );
}

function getResponseRefreshToken(headers) {
  return getStringValue(headers.get('x-refresh-token')) || getStringValue(headers.get('refresh-token'));
}

function stripAuthTokens(payload) {
  delete payload.token;
  delete payload.accessToken;
  delete payload.access_token;
  delete payload.jwt;
  delete payload.idToken;
  delete payload.authToken;
  delete payload.bearerToken;
  delete payload.refreshToken;
  delete payload.tokens;

  if (payload.data && typeof payload.data === 'object') {
    stripAuthTokens(payload.data);
  }

  if (payload.user && typeof payload.user === 'object') {
    stripAuthTokens(payload.user);
  }
}

function getStringValue(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function isAuthTokenEndpoint(path) {
  return (
    path === '/auth/signup' ||
    path === '/auth/verify-otp' ||
    path === '/auth/verify-email-otp' ||
    path === '/auth/send-otp'
  );
}

function shouldRetryWithRefreshToken(path) {
  return false;
}

function shouldPersistAuthToken(path, refreshedRequest) {
  return isAuthTokenEndpoint(path) || Boolean(refreshedRequest);
}

function shouldAttachAuthToken(path) {
  const publicAuthEndpoints = new Set([
    '/auth/check-user',
    '/auth/refresh-token',
    '/auth/signup',
  ]);

  return !publicAuthEndpoints.has(path);
}

function shouldClearAuthTokenOnUnauthorized(path) {
  const retryableUnauthorizedEndpoints = new Set([
    '/auth/send-otp',
    '/auth/verify-otp',
    '/auth/send-email-otp',
    '/auth/verify-email-otp',
    '/auth/refresh-token',
    '/kyc/selfie',
  ]);

  return shouldAttachAuthToken(path) && !retryableUnauthorizedEndpoints.has(path);
}

function shouldAttachRefreshToken(path) {
  return path === '/auth/refresh-token';
}

function normalizeBackendApiUrl(value = '') {
  const trimmedValue = String(value || '').trim().replace(/\/$/, '');
  return trimmedValue;
}

function normalizeBearerToken(value = '') {
  const trimmedValue = String(value || '').trim();

  if (!trimmedValue) {
    return '';
  }

  return trimmedValue.replace(/^Bearer\s+/i, '');
}

function getConnectionErrorMessage(path) {
  if (path === '/auth/send-otp' || path === '/auth/verify-otp' || path === '/auth/send-email-otp' || path === '/auth/verify-email-otp') {
    return 'OTP service is not reachable. Please start the API service and try again.';
  }

  return 'Service is temporarily unavailable. Please try again shortly.';
}
