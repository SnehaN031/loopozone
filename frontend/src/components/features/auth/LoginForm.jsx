'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Leaf,
  LockKeyhole,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { sendLoginOtp, verifyLoginOtp } from '@/services/auth.service';
import { formatIndianPhone, getIndianPhoneInputValue, isValidIndianPhone, setAuthSession, storeAuthTokens } from '@/services/client.service';
import { getKycStatus } from '@/services/kyc.service';

const trustItems = [
  { label: 'Secure', Icon: ShieldCheck },
  { label: 'No passwords', Icon: LockKeyhole },
  { label: 'Made in India', Icon: Leaf },
];

export function LoginForm() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpNotice, setOtpNotice] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const isSubmitDisabled = mobile.trim().length === 0 || isLoading;
  const canVerifyOtp = otpSent && otp.trim().length === 6;

  async function handleSubmit(event) {
    event.preventDefault();

    if (!isValidIndianPhone(mobile)) {
      setStatusMessage('Enter a valid Indian mobile number.');
      return;
    }

    setIsLoading(true);
    setStatusMessage('');
    setOtpNotice('');

    if (!otpSent) {
      try {
        const response = await sendLoginOtp(mobile);

        if (isOtpSentResponse(response)) {
          setOtpSent(true);
          setOtp('');
          setOtpNotice('OTP sent successfully.');
          return;
        }

        if (response.status === 'kyc_pending') {
          setStatusMessage('Your KYC is under review. Please try again later.');
          return;
        }

        setStatusMessage('Unable to send OTP. Please try again.');
      } catch (error) {
        setStatusMessage(getAuthBlockMessage(error));
      } finally {
        setIsLoading(false);
      }

      return;
    }

    if (!canVerifyOtp) {
      setStatusMessage('Enter the OTP to continue.');
      setIsLoading(false);
      return;
    }

    try {
      const authResponse = await verifyLoginOtp({ phone: mobile, otp: otp.trim() });
      storeAuthTokens(authResponse);
      const authUser = getAuthUser(authResponse);
      setAuthSession({
        ...authResponse,
        user: authUser || {
          phone: mobile,
        },
      });

      if (isNewUserAuthResponse(authResponse)) {
        router.push(`/sign_in?${getSignupParams(mobile).toString()}`);
        return;
      }

      const kycStatus = await getKycStatus();
      const accountStatus = mergeAccountStatus(authResponse, kycStatus);

      if (isRejectedKycStatus(accountStatus)) {
        setStatusMessage(getKycRejectionMessage(accountStatus));
        setIsLoading(false);
        return;
      }

      if (isPendingReviewKycStatus(accountStatus)) {
        setStatusMessage('Your KYC is currently under admin review. Please wait for approval.');
        setIsLoading(false);
        return;
      }

      if (isApprovedKycStatus(accountStatus)) {
        router.push('/dashboard');
        return;
      }

      router.push(`/sign_in?${getSignupParams(mobile).toString()}`);
    } catch (error) {
      if (isUnregisteredUserError(error)) {
        router.push(`/sign_in?${getSignupParams(mobile).toString()}`);
        return;
      }

      setStatusMessage(getVerifyOtpErrorMessage(error));
      setIsLoading(false);
    }
  }

  return (
    <section aria-labelledby="login-title">
      <div className="flex items-center text-[13px] font-semibold uppercase tracking-[0.08em] text-[#15803d] before:mr-3 before:h-0.5 before:w-4 before:bg-[#15803d] before:content-['']">
        Login
      </div>
      <h1 id="login-title" className="mt-5 text-[26px] font-semibold leading-tight tracking-[-0.6px] text-black">
        Welcome back
      </h1>
      <p className="mt-3 text-[13px] text-[#6b7280]">
        Enter your mobile number to get a one-time password
      </p>

      <form className="mt-12" onSubmit={handleSubmit}>
        <div>
          <label className="text-[14px] font-medium text-[#111827]" htmlFor="mobile-number">
            Mobile number
          </label>
          <div className="mt-3 flex min-h-[58px] overflow-hidden rounded-[11px] border-[1.5px] border-[#d9d9d6] bg-white transition focus-within:border-[#15803d] focus-within:shadow-[0_0_0_4px_rgba(21,128,61,0.07)]">
            <div className="flex shrink-0 items-center gap-2 border-r border-[#d9d9d6] px-4 text-[14px] font-medium text-[#111827]">
              <span aria-hidden="true">IN</span>
              <span>+91</span>
            </div>
            <input
              id="mobile-number"
              name="mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              className="min-w-0 flex-1 px-[14px] py-[13px] text-[14px] font-medium text-[#111827] outline-none placeholder:text-[#8a8f98]"
              placeholder="98765 43210"
              value={mobile}
              onChange={(event) => {
                setMobile(getIndianPhoneInputValue(event.target.value));
                setOtpSent(false);
                setOtp('');
                setOtpNotice('');
                setStatusMessage('');
              }}
            />
          </div>
        </div>

        {otpSent && (
          <div className="mt-6">
            <label className="text-[14px] font-medium text-[#111827]" htmlFor="login-otp">
              Enter OTP
            </label>
            <div className="mt-3 flex min-h-[58px] items-center rounded-[11px] border-[1.5px] border-[#d9d9d6] bg-white px-[14px] transition focus-within:border-[#15803d] focus-within:shadow-[0_0_0_4px_rgba(21,128,61,0.07)]">
              <ShieldCheck className="mr-3 size-5 shrink-0 text-[#15803d]" />
              <input
                id="login-otp"
                name="otp"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                className="min-w-0 flex-1 py-[13px] text-[14px] font-medium text-[#111827] outline-none placeholder:text-[#8a8f98]"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </div>
            {otpNotice && (
              <div className="mt-3 flex items-center gap-2 text-[13px] font-semibold text-[#15803d]">
                <Check className="size-4 shrink-0" />
                <span>{otpNotice}</span>
              </div>
            )}
          </div>
        )}

        {statusMessage && (
          <div className="mt-6 flex items-center gap-3 rounded-[11px] border border-[#fecaca] bg-[#fef2f2] px-4 py-4 text-[14px] font-medium text-[#b91c1c]">
            <AlertCircle className="size-4 shrink-0" />
            <p>{statusMessage}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitDisabled || (otpSent && !canVerifyOtp)}
          className="mt-10 flex w-full items-center justify-center gap-3 rounded-[11px] bg-[#15803d] px-4 py-[14px] text-[15px] font-semibold text-white transition hover:-translate-y-px hover:bg-[#14532d] active:scale-[0.99] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Please wait' : otpSent ? 'Verify OTP' : 'Send OTP'}
          <ArrowRight className="size-4" />
        </button>

        <div className="my-7 flex items-center gap-4 text-[13px] text-[#6b7280]">
          <div className="h-px flex-1 bg-[#dededb]" />
          <span>new to LoopOZone?</span>
          <div className="h-px flex-1 bg-[#dededb]" />
        </div>

        <Link
          href="/sign_in"
          className="flex w-full items-center justify-center gap-3 rounded-[11px] border-[1.5px] border-[#15803d] bg-white px-4 py-[14px] text-[15px] font-semibold text-[#15803d] transition hover:-translate-y-px hover:bg-[#f0fdf4] active:scale-[0.99]"
        >
          <UserPlus className="size-4" />
          Create account
        </Link>

        <div className="mt-8 border-t border-[#dededb] pt-6">
          <div className="flex flex-wrap items-center justify-center gap-y-3 text-[13px] text-[#6b7280]">
            {trustItems.map(({ label, Icon }, index) => (
              <div key={label} className="flex items-center">
                {index > 0 && <div className="mx-5 h-5 w-px bg-[#dededb]" />}
                <span className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-[#15803d]" />
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </form>
    </section>
  );
}

function getSignupParams(mobile) {
  return new URLSearchParams({ verified: 'mobile', mobile: formatIndianPhone(mobile) });
}

function isOtpSentResponse(response) {
  return response?.success === true || response?.status === 'otp_sent' || response?.status === 'new_user';
}

function getAuthBlockMessage(error) {
  const payload = error?.payload || {};

  if (payload.rejected) {
    return getKycRejectionMessage(payload);
  }

  if (payload.pendingReview) {
    return payload.message || 'Your KYC is currently under admin review. Please wait for approval.';
  }

  return error.message;
}

function getVerifyOtpErrorMessage(error) {
  const message = String(error?.message || error?.payload?.message || error?.payload?.error || '').trim();

  if (error?.status === 400 || error?.status === 401) {
    return 'Invalid or expired OTP. Please try again.';
  }

  if (error?.status === 404 && /user|profile|not\s+found|registered/i.test(message)) {
    return 'This mobile number is not registered.';
  }

  return message || 'Unable to verify OTP. Please try again.';
}

function isUnregisteredUserError(error) {
  const message = String(error?.message || error?.payload?.message || error?.payload?.error || '').trim();
  const payload = error?.payload || {};

  return Boolean(
    payload.existingUser === false ||
      payload.newUser === true ||
      payload.status === 'new_user' ||
      (error?.status === 404 && /user|profile|not\s+found|not\s+registered/i.test(message))
  );
}

function isNewUserAuthResponse(response) {
  return Boolean(
    response?.existingUser === false ||
      response?.newUser === true ||
      response?.status === 'new_user' ||
      response?.redirect === '/signup'
  );
}

function isRejectedKycStatus(response) {
  return String(response?.kycStatus || response?.status || response?.user?.kycStatus || '').toLowerCase() === 'rejected';
}

function isPendingReviewKycStatus(response) {
  const status = String(response?.kycStatus || response?.status || response?.user?.kycStatus || '').toLowerCase();
  return response?.pendingReview === true || status === 'pending_review';
}

function isApprovedKycStatus(response) {
  const status = String(response?.kycStatus || response?.status || response?.user?.kycStatus || '').toLowerCase();
  return response?.isKycVerified === true || response?.user?.isKycVerified === true || status === 'approved';
}

function mergeAccountStatus(authResponse, kycStatus) {
  return {
    ...(authResponse || {}),
    ...(kycStatus || {}),
    user: {
      ...(authResponse?.user || {}),
      ...(kycStatus?.user || {}),
    },
  };
}

function getAuthUser(response) {
  const user = response?.user || response?.data?.user || response?.data?.profile || response?.profile || response?.data;

  if (!user || typeof user !== 'object') {
    return null;
  }

  return user;
}

function getKycRejectionMessage(response) {
  const reason = String(response?.reason || response?.rejectionReason || response?.user?.rejectionReason || '').trim();

  if (reason) {
    return `Your KYC was rejected. Reason: ${reason}`;
  }

  return 'Your KYC was rejected. Please contact support or re-upload your documents.';
}
