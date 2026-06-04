'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  checkUser,
  sendEmailLoginOtp,
  sendLoginOtp,
  verifyEmailLoginOtp,
  verifyLoginOtp,
} from '@/services/auth.service';
import {
  formatIndianPhone,
  getIndianPhoneInputValue,
  isValidIndianPhone,
  saveSignupDraft,
  setAuthSession,
  storeAuthTokens,
} from '@/services/client.service';
import { OnboardingStepProgress } from './OnboardingStepProgress';

export function SignInForm({ verifiedType = '', verifiedValue = '' }) {
  const router = useRouter();
  const initialMobile = verifiedType === 'mobile' ? getIndianPhoneInputValue(verifiedValue) : '';
  const initialEmail = verifiedType === 'email' ? verifiedValue : '';
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState(initialMobile);
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(verifiedType === 'mobile' && Boolean(verifiedValue));
  const [email, setEmail] = useState(initialEmail);
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(verifiedType === 'email' && Boolean(verifiedValue));
  const [statusMessage, setStatusMessage] = useState('');
  const [mobileStatusMessage, setMobileStatusMessage] = useState('');
  const [emailStatusMessage, setEmailStatusMessage] = useState('');
  const [isMobileOtpLoading, setIsMobileOtpLoading] = useState(false);
  const [isEmailOtpLoading, setIsEmailOtpLoading] = useState(false);
  const canContinue = Boolean(fullName.trim() && isValidEmail(email) && isValidIndianPhone(mobile) && mobileVerified && emailVerified);

  const verified = useMemo(
    () => ({
      mobile: mobileVerified,
      email: emailVerified,
    }),
    [mobileVerified, emailVerified]
  );

  function handleSubmit(event) {
    event.preventDefault();

    if (!fullName.trim()) {
      setStatusMessage('Enter your full name to continue.');
      return;
    }

    if (!isValidIndianPhone(mobile)) {
      setStatusMessage('Enter a valid Indian mobile number.');
      return;
    }

    if (!mobileVerified) {
      setStatusMessage('Verify your mobile OTP to continue.');
      return;
    }

    if (!email.trim()) {
      setStatusMessage('Enter your email address to continue.');
      return;
    }

    if (!isValidEmail(email)) {
      setStatusMessage('Enter a valid email address.');
      return;
    }

    if (!emailVerified) {
      setStatusMessage('Verify your email OTP to continue.');
      return;
    }

    saveSignupDraft({
      name: fullName.trim(),
      phone: formatIndianPhone(mobile),
      email: email.trim().toLowerCase(),
    });
    router.push('/sign_in/account-type');
  }

  async function handleSendMobileOtp() {
    if (!isValidIndianPhone(mobile)) {
      setMobileStatusMessage('');
      setStatusMessage('Enter a valid Indian mobile number.');
      return;
    }

    setIsMobileOtpLoading(true);
    setStatusMessage('');
    setMobileStatusMessage('');

    try {
      const existingUser = await getExistingUserStatus(() => checkUser(mobile));

      if (isExistingUserResponse(existingUser)) {
        setStatusMessage('This mobile number already exists. Please login to continue.');
        return;
      }

      const response = await sendLoginOtp(mobile);

      if (response?.success === true || response?.status === 'otp_sent' || response?.status === 'new_user') {
        setMobileOtpSent(true);
        setMobileOtp('');
        setMobileStatusMessage('OTP sent successfully.');
        return;
      }

      setStatusMessage('Unable to send OTP. Please try again.');
    } catch (error) {
      setStatusMessage(getAuthBlockMessage(error));
    } finally {
      setIsMobileOtpLoading(false);
    }
  }

  async function handleVerifyMobileOtp() {
    if (/\D/.test(mobileOtp.trim())) {
      setStatusMessage('Wrong OTP. Enter numbers only.');
      return;
    }

    if (mobileOtp.trim().length !== 6) {
      setStatusMessage('OTP should be 6 digits.');
      return;
    }

    setIsMobileOtpLoading(true);
    setStatusMessage('');

    try {
      const response = await verifyLoginOtp({ phone: mobile, otp: mobileOtp.trim() });

      storeAuthTokens(response);
      setAuthSession({
        ...response,
        user: response?.user || {
          phone: formatIndianPhone(mobile),
        },
      });

      setMobileVerified(true);
      setMobileOtpSent(false);
      setMobileStatusMessage('');
    } catch (error) {
      setStatusMessage(error.status === 400 || error.status === 401 ? 'Invalid OTP. Please try again.' : error.message);
    } finally {
      setIsMobileOtpLoading(false);
    }
  }

  async function handleSendEmailOtp() {
    if (!mobileVerified) {
      setEmailStatusMessage('');
      setStatusMessage('Verify your mobile number before sending email OTP.');
      return;
    }

    if (!isValidEmail(email)) {
      setEmailStatusMessage('');
      setStatusMessage('Enter a valid email address.');
      return;
    }

    setIsEmailOtpLoading(true);
    setStatusMessage('');
    setEmailStatusMessage('');

    try {
      const response = await sendEmailLoginOtp({ email, phone: mobile });

      if (response?.success === true || response?.status === 'otp_sent' || response?.status === 'new_user') {
        setEmailOtpSent(true);
        setEmailOtp('');
        setEmailStatusMessage('OTP sent successfully.');
        return;
      }

      setStatusMessage('Unable to send OTP. Please try again.');
    } catch (error) {
      setStatusMessage('Unable to send OTP. Please try again.');
    } finally {
      setIsEmailOtpLoading(false);
    }
  }

  async function handleVerifyEmailOtp() {
    if (/\D/.test(emailOtp.trim())) {
      setStatusMessage('Wrong OTP. Enter numbers only.');
      return;
    }

    if (emailOtp.trim().length !== 6) {
      setStatusMessage('OTP should be 6 digits.');
      return;
    }

    setIsEmailOtpLoading(true);
    setStatusMessage('');

    try {
      const response = await verifyEmailLoginOtp({ email, phone: mobile, otp: emailOtp.trim() });
      setAuthSession({
        ...response,
        user: response?.user || {
          phone: formatIndianPhone(mobile),
          email: email.trim().toLowerCase(),
        },
      });

      setEmailVerified(true);
      setEmailOtpSent(false);
      setEmailStatusMessage('');
    } catch (error) {
      setStatusMessage(error.status === 400 || error.status === 401 ? 'Invalid OTP. Please try again.' : error.message);
    } finally {
      setIsEmailOtpLoading(false);
    }
  }

  return (
    <section aria-labelledby="sign-in-title">
      <OnboardingStepProgress activeStep={1} />

      <div className="mt-12 flex items-center text-[14px] font-semibold uppercase tracking-[0.08em] text-[#15803d] before:mr-3 before:h-0.5 before:w-4 before:bg-[#15803d] before:content-['']">
        Step 1 of 5
      </div>

      <h1
        id="sign-in-title"
        className="mt-5 text-[34px] font-semibold leading-tight tracking-[-0.8px] text-[#27272a] sm:text-[38px]"
      >
        Sign in
      </h1>
      <p className="mt-4 text-[18px] text-[#6b7280]">Complete your details to continue</p>

      <form className="mt-9 space-y-7" onSubmit={handleSubmit}>
        <FormField label="Full name" htmlFor="full-name">
          <div className="flex min-h-[58px] items-center rounded-[11px] border-[1.5px] border-[#d9d9d6] bg-white px-[18px] transition focus-within:border-[#15803d] focus-within:shadow-[0_0_0_4px_rgba(21,128,61,0.07)]">
            <UserRound className="mr-5 size-5 shrink-0 text-[#737373]" />
            <input
              id="full-name"
              name="fullName"
              className="min-w-0 flex-1 py-[13px] text-[17px] font-medium text-[#27272a] outline-none placeholder:text-[#8a8f98]"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Ravi Kumar"
            />
          </div>
        </FormField>

        <VerificationBlock
          label="Mobile number"
          inputId="mobile-number"
          inputName="mobile"
          inputType="tel"
          inputMode="numeric"
          maxLength={10}
          value={mobile}
          onChange={(value) => {
            setMobile(getIndianPhoneInputValue(value));
            setMobileOtp('');
            setMobileOtpSent(false);
            setMobileVerified(false);
            setMobileStatusMessage('');
            setStatusMessage('');
          }}
          prefix={
            <div className="flex min-h-[58px] shrink-0 items-center gap-2 border-r border-[#d9d9d6] px-5 text-[15px] font-medium text-[#27272a]">
              <span>IN</span>
              <span>+91</span>
            </div>
          }
          verified={verified.mobile}
          verifiedText="Mobile number verified"
          otpValue={mobileOtp}
          onOtpChange={(value) => {
            setMobileOtp(value.slice(0, 6));
            setStatusMessage('');
          }}
          otpSent={mobileOtpSent}
          otpStatusMessage={mobileStatusMessage}
          isOtpLoading={isMobileOtpLoading}
          onSendOtp={handleSendMobileOtp}
          onVerifyOtp={handleVerifyMobileOtp}
        />

        <Divider />

        <VerificationBlock
          label="Email address"
          inputId="email-address"
          inputName="email"
          inputType="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            setEmailOtp('');
            setEmailOtpSent(false);
            setEmailVerified(false);
            setEmailStatusMessage('');
            setStatusMessage('');
          }}
          prefix={<Mail className="ml-5 mr-5 size-5 shrink-0 text-[#737373]" />}
          verified={verified.email}
          verifiedText="Email verified"
          otpValue={emailOtp}
          onOtpChange={(value) => {
            setEmailOtp(value.slice(0, 6));
            setStatusMessage('');
          }}
          otpSent={emailOtpSent}
          otpStatusMessage={emailStatusMessage}
          isOtpLoading={isEmailOtpLoading}
          onSendOtp={handleSendEmailOtp}
          onVerifyOtp={handleVerifyEmailOtp}
        />

        {statusMessage && (
          <div className="rounded-[11px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-[15px] font-semibold text-[#b91c1c]">
            {statusMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!canContinue}
          className="flex min-h-[58px] w-full items-center justify-center gap-4 rounded-[11px] bg-[#15803d] px-4 py-[14px] text-[18px] font-semibold text-white transition hover:-translate-y-px hover:bg-[#14532d] active:scale-[0.99] disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-[1.5px] disabled:border-[#dededb] disabled:bg-white disabled:text-[#9ca3af]"
        >
          Continue
          <ArrowRight className="size-5" />
        </button>

        <p className="text-center text-[15px] text-[#6b7280]">
          Already verified?{' '}
          <Link href="/login" className="font-semibold text-[#15803d] transition hover:text-[#14532d]">
            Log in
          </Link>
        </p>
      </form>
    </section>
  );
}

function FormField({ label, htmlFor, children }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="mb-3 block text-[15px] font-semibold text-[#52525b]">{label}</span>
      {children}
    </label>
  );
}

function VerificationBlock({
  label,
  inputId,
  inputName,
  inputType,
  inputMode,
  maxLength,
  value,
  onChange,
  prefix,
  verified,
  verifiedText,
  otpValue = '',
  onOtpChange,
  otpSent = false,
  otpStatusMessage = '',
  isOtpLoading = false,
  onSendOtp,
  onVerifyOtp,
}) {
  return (
    <FormField label={label} htmlFor={inputId}>
      <div className="space-y-2">
        <div
          className={[
            'flex min-h-[58px] items-center overflow-hidden rounded-[11px] border-[1.5px] transition focus-within:border-[#15803d] focus-within:shadow-[0_0_0_4px_rgba(21,128,61,0.07)]',
            verified ? 'border-[#15803d]/35 bg-[#f0fdf4]' : 'border-[#d9d9d6] bg-white',
          ].join(' ')}
        >
          {prefix}
          <input
            id={inputId}
            name={inputName}
            type={inputType}
            inputMode={inputMode}
            maxLength={maxLength}
            readOnly={verified}
            className="min-w-0 flex-1 bg-transparent px-[18px] py-[13px] text-[17px] font-medium text-[#27272a] outline-none placeholder:text-[#8a8f98]"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
          {verified ? (
            <div className="flex shrink-0 items-center px-4">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#15803d] text-white">
                <Check className="size-4" />
              </span>
            </div>
          ) : onSendOtp ? (
            <div className="flex shrink-0 items-center px-3">
              <button
                type="button"
                disabled={isOtpLoading}
                onClick={onSendOtp}
                className="rounded-[8px] border-[1.5px] border-[#15803d]/50 px-4 py-2 text-[14px] font-semibold text-[#15803d] transition hover:-translate-y-px hover:bg-[#f0fdf4] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>
          ) : null}
        </div>

        {!verified && otpSent && (
          <div className="flex min-h-[54px] items-center overflow-hidden rounded-[11px] border-[1.5px] border-[#e2e2df] bg-white">
            <div className="flex shrink-0 items-center px-5 text-[#15803d]">
              <ShieldCheck className="size-5" />
            </div>
            <input
              name={`${inputName}Otp`}
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              className="min-w-0 flex-1 bg-transparent px-2 py-[12px] text-[16px] font-medium text-[#27272a] outline-none placeholder:text-[#8a8f98]"
              value={otpValue}
              onChange={(event) => onOtpChange?.(event.target.value)}
              placeholder="Enter 6-digit OTP"
            />
            <div className="flex shrink-0 items-center px-3">
              <button
                type="button"
                disabled={isOtpLoading || otpValue.length !== 6}
                onClick={onVerifyOtp}
                className="min-w-[96px] rounded-[8px] border border-[#15803d]/40 px-4 py-2 text-[14px] font-semibold text-[#15803d] transition hover:bg-[#f0fdf4] disabled:cursor-not-allowed disabled:border-[#dededb] disabled:bg-[#fafafa] disabled:text-[#a1a1aa]"
              >
                Verify
              </button>
            </div>
          </div>
        )}

        {!verified && otpStatusMessage && (
          <div className="flex items-center gap-2 pt-1 text-[14px] font-semibold text-[#15803d]">
            <Check className="size-4 shrink-0" />
            {otpStatusMessage}
          </div>
          )}

        {verified && (
          <div className="flex items-center gap-3 pt-2 text-[16px] font-medium text-[#15803d]">
            <span className="flex size-5 items-center justify-center rounded-full bg-[#15803d] text-white">
              <Check className="size-3.5" />
            </span>
            {verifiedText}
          </div>
        )}
      </div>
    </FormField>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-6 py-2 text-[14px] font-medium text-[#6b7280]">
      <div className="h-px flex-1 bg-[#dededb]" />
      OR
      <div className="h-px flex-1 bg-[#dededb]" />
    </div>
  );
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function getAuthBlockMessage(error) {
  const payload = error?.payload || {};

  if (payload.rejected) {
    const reason = String(payload.reason || payload.rejectionReason || payload.user?.rejectionReason || '').trim();
    return reason ? `Your KYC was rejected. Reason: ${reason}` : 'Your KYC was rejected. Please contact support or re-upload your documents.';
  }

  if (payload.pendingReview) {
    return payload.message || 'Your KYC is currently under admin review. Please wait for approval.';
  }

  return error.message;
}

function isExistingUserResponse(response) {
  const status = String(response?.status || response?.user?.status || '').toLowerCase();

  return Boolean(
    response?.exists === true ||
      response?.userExists === true ||
      response?.isExistingUser === true ||
      response?.alreadyRegistered === true ||
      response?.user ||
      status === 'existing_user' ||
      status === 'exists' ||
      status === 'registered'
  );
}

async function getExistingUserStatus(request) {
  try {
    return await request();
  } catch (error) {
    const message = String(error?.message || '').toLowerCase();

    if (
      error?.status === 0 ||
      error?.status === 404 ||
      error?.status >= 500 ||
      message.includes('not found') ||
      message.includes('not exist') ||
      message.includes('new user') ||
      message.includes('temporarily unavailable')
    ) {
      return null;
    }

    throw error;
  }
}
