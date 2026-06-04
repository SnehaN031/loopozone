'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  Check,
  Clock3,
  CreditCard,
  FileUp,
  Image as ImageIcon,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  getKycStatus,
  sendAadhaarOtp,
  submitKycForReview,
  uploadSelfie,
  verifyAadhaarOtp,
  verifyGstCertificate,
  verifyPanCard,
} from '@/services/kyc.service';
import { OnboardingStepProgress } from './OnboardingStepProgress';

const SELFIE_MAX_DIMENSION = 720;
const SELFIE_JPEG_QUALITY = 0.72;

export function VerificationPayoutForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('kyc');
  const [confirmed, setConfirmed] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [documentMessages, setDocumentMessages] = useState({
    aadhaar: '',
    pan: '',
    gst: '',
    selfie: '',
  });
  const [backHref, setBackHref] = useState('/sign_in/account-type');
  const [accountType, setAccountType] = useState('');
  const [isKycLoading, setIsKycLoading] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarOtp, setAadhaarOtp] = useState('');
  const [aadhaarOtpNotice, setAadhaarOtpNotice] = useState('');
  const [aadhaarReferenceId, setAadhaarReferenceId] = useState('');
  const [aadhaarStatus, setAadhaarStatus] = useState('idle');
  const [panNumber, setPanNumber] = useState('');
  const [panImage, setPanImage] = useState(null);
  const [panStatus, setPanStatus] = useState('idle');
  const [gstNumber, setGstNumber] = useState('');
  const [gstCertificate, setGstCertificate] = useState(null);
  const [gstStatus, setGstStatus] = useState('idle');
  const [selfieFile, setSelfieFile] = useState(null);
  const [selfieStatus, setSelfieStatus] = useState('idle');
  const isBusinessSeller = accountType === 'corporate' || accountType === 'trader';
  const isAadhaarVerified = aadhaarStatus === 'verified';
  const isPanVerified = panStatus === 'verified';
  const isGstVerified = gstStatus === 'verified';
  const canVerifyPan = isAadhaarVerified;
  const canVerifyGst = isBusinessSeller && isPanVerified;
  const canUploadSelfie = isAadhaarVerified && isPanVerified && (!isBusinessSeller || isGstVerified);
  const isKycComplete = canUploadSelfie && selfieStatus === 'verified';

  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get('from');
    setBackHref(getBackHref(from));
    setAccountType(getAccountType(from));
    hydrateKycStatus();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatusMessage('');

    if (!isKycComplete) {
      setStatusMessage('Complete all required KYC verification steps before submitting.');
      return;
    }

    setIsKycLoading(true);

    try {
      await submitKycForReview();
      router.push(`/sign_in/success?from=${accountType}`);
    } catch (error) {
      setStatusMessage(error.message);
      setIsKycLoading(false);
    }
  }

  async function hydrateKycStatus() {
    try {
      const response = await getKycStatus();
      const documents = response.documents || {};

      if (documents.aadhaar === 'verified') {
        setAadhaarStatus('verified');
      }

      if (documents.pan === 'verified') {
        setPanStatus('verified');
      }

      if (documents.gst === 'verified') {
        setGstStatus('verified');
      }

      if (documents.selfie === 'verified') {
        setSelfieStatus('verified');
      }
    } catch {
      // Status is best-effort; individual actions will surface API errors.
    }
  }

  async function handleSendAadhaarOtp() {
    if (!requireToken()) {
      return;
    }

    const normalizedAadhaar = aadhaarNumber.replace(/\D/g, '');

    if (normalizedAadhaar.length !== 12) {
      setDocumentMessage('aadhaar', 'Enter a valid 12-digit Aadhaar number.');
      return;
    }

    setIsKycLoading(true);
    setStatusMessage('');
    setDocumentMessage('aadhaar', '');
    setAadhaarOtpNotice('');

    try {
      const response = await sendAadhaarOtp(normalizedAadhaar);
      setAadhaarReferenceId(response.referenceId || '');
      setAadhaarStatus('otp_sent');
      setAadhaarOtpNotice('OTP sent successfully.');
    } catch (error) {
      setDocumentMessage('aadhaar', error.message);
    } finally {
      setIsKycLoading(false);
    }
  }

  async function handleVerifyAadhaarOtp() {
    if (!requireToken()) {
      return;
    }

    if (!aadhaarReferenceId) {
      setDocumentMessage('aadhaar', 'Send Aadhaar OTP before verifying.');
      return;
    }

    if (!/^\d{6}$/.test(aadhaarOtp.trim())) {
      setDocumentMessage('aadhaar', 'Enter a valid 6-digit Aadhaar OTP.');
      return;
    }

    setIsKycLoading(true);
    setStatusMessage('');
    setDocumentMessage('aadhaar', '');

    try {
      const response = await verifyAadhaarOtp({
        aadhaarNumber,
        otp: aadhaarOtp.trim(),
        referenceId: aadhaarReferenceId,
      });
      setAadhaarStatus('verified');
      setAadhaarOtpNotice('');
      setDocumentMessage('aadhaar', response.message || 'Aadhaar verified successfully.');
      setDocumentMessage('pan', '');
      hydrateKycStatus();
    } catch (error) {
      setDocumentMessage('aadhaar', error.message);
    } finally {
      setIsKycLoading(false);
    }
  }

  async function handleVerifyPan() {
    if (!requireToken()) {
      return;
    }

    if (!canVerifyPan) {
      setDocumentMessage('pan', 'Verify Aadhaar before verifying PAN.');
      return;
    }

    if (!/^[A-Z]{5}\d{4}[A-Z]$/i.test(panNumber.trim())) {
      setDocumentMessage('pan', 'Enter a valid PAN number. Example: ABCDE1234F.');
      return;
    }

    if (!panImage) {
      setDocumentMessage('pan', 'Upload PAN card image or PDF.');
      return;
    }

    setIsKycLoading(true);
    setStatusMessage('');
    setDocumentMessage('pan', '');

    try {
      const extractedPanFromImage = await extractDocumentNumberFromUpload(panImage, 'pan', panNumber);
      const response = await verifyPanCard({ pan: panNumber, panImage, extractedPan: extractedPanFromImage });
      const extractedPan = getResponseDocumentNumber(response, 'pan') || extractedPanFromImage;

      if (!extractedPan || extractedPan !== normalizeDocumentNumber(panNumber)) {
        setDocumentMessage('pan', 'PAN card mismatch with the PAN number.');
        return;
      }

      setPanStatus('verified');
      setDocumentMessage('pan', response.message || 'PAN card verified successfully.');
      setDocumentMessage('aadhaar', '');
      setDocumentMessage('gst', '');
      setDocumentMessage('selfie', '');
      hydrateKycStatus();
    } catch (error) {
      setDocumentMessage('pan', error.message);
    } finally {
      setIsKycLoading(false);
    }
  }

  async function handleVerifyGst() {
    if (!requireToken()) {
      return;
    }

    if (!isBusinessSeller) {
      setDocumentMessage('gst', 'GST verification is only required for business sellers.');
      return;
    }

    if (!canVerifyGst) {
      setDocumentMessage('gst', 'Verify PAN before verifying GST.');
      return;
    }

    if (!isValidGstin(gstNumber)) {
      setDocumentMessage('gst', 'Enter a valid GSTIN. Example: 29ABCDE1234F1Z5.');
      return;
    }

    if (!gstCertificate) {
      setDocumentMessage('gst', 'Upload GST certificate image or PDF.');
      return;
    }

    setIsKycLoading(true);
    setStatusMessage('');
    setDocumentMessage('gst', '');

    try {
      const extractedGstFromImage = await extractDocumentNumberFromUpload(gstCertificate, 'gst', gstNumber, {
        optional: true,
      });
      const normalizedGstNumber = normalizeDocumentNumber(gstNumber);
      const response = await verifyGstCertificate({ gstNumber, gstCertificate, extractedGst: extractedGstFromImage });
      const extractedGst = getResponseDocumentNumber(response, 'gst') || extractedGstFromImage;

      if (extractedGst && extractedGst !== normalizedGstNumber) {
        setDocumentMessage('gst', 'GST mismatch with the GST number.');
        return;
      }

      setGstStatus('verified');
      setDocumentMessage('gst', response.message || 'GST certificate verified successfully.');
      setDocumentMessage('pan', '');
      setDocumentMessage('selfie', '');
      hydrateKycStatus();
    } catch (error) {
      setDocumentMessage('gst', getKycApiErrorMessage(error));
    } finally {
      setIsKycLoading(false);
    }
  }

  async function handleUploadSelfie() {
    if (!requireToken()) {
      return;
    }

    if (!canUploadSelfie) {
      setDocumentMessage('selfie', isBusinessSeller ? 'Verify Aadhaar, PAN, and GST before uploading selfie.' : 'Verify Aadhaar and PAN before uploading selfie.');
      return;
    }

    if (!selfieFile) {
      setDocumentMessage('selfie', 'Capture a selfie before uploading.');
      return;
    }

    setIsKycLoading(true);
    setStatusMessage('');
    setDocumentMessage('selfie', '');

    try {
      await uploadSelfie(selfieFile);
      setSelfieStatus('verified');
      setDocumentMessage('selfie', '');
      setDocumentMessage('aadhaar', '');
      setDocumentMessage('pan', '');
      setDocumentMessage('gst', '');
      hydrateKycStatus();
    } catch (error) {
      setDocumentMessage('selfie', error.message);
    } finally {
      setIsKycLoading(false);
    }
  }

  function setDocumentMessage(name, message) {
    setDocumentMessages((current) => ({ ...current, [name]: message }));
  }

  function requireToken() {
    return true;
  }

  return (
    <main className="min-h-screen bg-[#fbfdfc] font-sans text-[#10233f]">
      <form
        className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 pb-8 pt-6 sm:px-6 lg:px-8"
        onSubmit={handleSubmit}
      >
        <div className="mx-auto flex w-full max-w-[1320px] justify-center">
          <OnboardingStepProgress activeStep={4} accountType={accountType} />
        </div>

        <header className="relative mx-auto mt-8 w-full max-w-[1320px] text-center">
          <Link
            href={backHref}
            aria-label="Back to corporate details"
            className="absolute left-0 top-0 hidden size-10 items-center justify-center rounded-full border border-[#e1e7e3] bg-white text-[#10233f] shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition hover:-translate-y-px hover:text-[#15803d] sm:flex"
          >
            <ArrowLeft className="size-5" />
          </Link>

          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#475569] sm:text-[13px]">
            Step 4 of 5
          </div>

          <div className="mx-auto mt-4 flex size-12 items-center justify-center rounded-[12px] border border-[#e8eee9] bg-white text-[#0f5b40] shadow-[0_12px_30px_rgba(15,23,42,0.07)]">
            <ShieldCheck className="size-7" />
          </div>

          <h1 className="mt-4 text-[28px] font-semibold leading-tight text-[#10233f] sm:text-[32px]">
            Verification &amp; Payout
          </h1>
          <p className="mx-auto mt-2 max-w-[620px] text-[14px] leading-6 text-[#475569] sm:text-[15px]">
            Upload your documents and setup billing to start trading securely.
          </p>
        </header>

        <div className="mx-auto mt-8 grid w-full max-w-[840px] grid-cols-2 border-b border-[#d7ded8] text-center text-[14px] font-semibold sm:text-[15px]">
          <button
            type="button"
            className={[
              '-mb-px border-b-2 pb-3 transition',
              activeTab === 'kyc' ? 'border-[#0b8a4b] text-[#0b7f45]' : 'border-transparent text-[#10233f]',
            ].join(' ')}
            onClick={() => setActiveTab('kyc')}
          >
            KYC Documents
          </button>
          <button
            type="button"
            className={[
              '-mb-px border-b-2 pb-3 transition',
              activeTab === 'payout' ? 'border-[#0b8a4b] text-[#0b7f45]' : 'border-transparent text-[#10233f]',
            ].join(' ')}
            onClick={() => setActiveTab('payout')}
          >
            Payout / Billing
          </button>
        </div>

        {activeTab === 'kyc' ? (
          <KycDocuments
            aadhaarNumber={aadhaarNumber}
            setAadhaarNumber={setAadhaarNumber}
            aadhaarOtp={aadhaarOtp}
            setAadhaarOtp={setAadhaarOtp}
            aadhaarOtpNotice={aadhaarOtpNotice}
            setAadhaarOtpNotice={setAadhaarOtpNotice}
            aadhaarStatus={aadhaarStatus}
            panNumber={panNumber}
            setPanNumber={setPanNumber}
            panImage={panImage}
            setPanImage={setPanImage}
            panStatus={panStatus}
            gstNumber={gstNumber}
            setGstNumber={setGstNumber}
            gstCertificate={gstCertificate}
            setGstCertificate={setGstCertificate}
            gstStatus={gstStatus}
            selfieFile={selfieFile}
            setSelfieFile={setSelfieFile}
            selfieStatus={selfieStatus}
            documentMessages={documentMessages}
            setDocumentMessage={setDocumentMessage}
            isBusinessSeller={isBusinessSeller}
            canVerifyPan={canVerifyPan}
            canVerifyGst={canVerifyGst}
            canUploadSelfie={canUploadSelfie}
            isLoading={isKycLoading}
            onSendAadhaarOtp={handleSendAadhaarOtp}
            onVerifyAadhaarOtp={handleVerifyAadhaarOtp}
            onVerifyPan={handleVerifyPan}
            onVerifyGst={handleVerifyGst}
            onUploadSelfie={handleUploadSelfie}
            confirmed={confirmed}
            setConfirmed={setConfirmed}
          />
        ) : (
          <PayoutBilling confirmed={confirmed} setConfirmed={setConfirmed} />
        )}

        {statusMessage && (
          <div
            className={[
              'mx-auto mt-5 w-full max-w-[1320px] rounded-[8px] border bg-white px-4 py-3 text-[14px] font-semibold shadow-[0_8px_18px_rgba(15,23,42,0.04)]',
              isErrorMessage(statusMessage) ? 'border-[#fecaca] text-[#b91c1c]' : 'border-[#dbe6dd] text-[#15803d]',
            ].join(' ')}
          >
            {statusMessage}
          </div>
        )}

        <div className="mx-auto mt-5 grid w-full max-w-[1320px] grid-cols-2 gap-5">
          <Link
            href={backHref}
            className="flex min-h-[46px] items-center justify-center gap-2 rounded-[8px] border border-[#cbded1] bg-white text-[15px] font-semibold text-[#10233f] transition hover:-translate-y-px hover:border-[#0b8a4b]"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
          <button
            type="submit"
            disabled={isKycLoading || !confirmed || !isKycComplete}
            className="flex min-h-[46px] items-center justify-center rounded-[8px] bg-[#0b8a4b] px-4 text-[15px] font-semibold text-white shadow-[0_10px_22px_rgba(11,138,75,0.16)] transition hover:-translate-y-px hover:bg-[#08723f] active:scale-[0.99] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isKycLoading ? 'Submitting' : 'Submit Details'}
          </button>
        </div>
      </form>
    </main>
  );
}

function getBackHref(from) {
  if (from === 'personal') {
    return '/sign_in/personal-details?account=personal';
  }

  if (from === 'trader') {
    return '/sign_in/trader-details?account=trader';
  }

  if (from === 'corporate') {
    return '/sign_in/corporate-details?account=corporate';
  }

  return '/sign_in/account-type';
}

function getAccountType(from) {
  if (from === 'personal') {
    return 'personal';
  }

  if (from === 'trader') {
    return 'trader';
  }

  if (from === 'corporate') {
    return 'corporate';
  }

  return '';
}

function KycDocuments({
  aadhaarNumber,
  setAadhaarNumber,
  aadhaarOtp,
  setAadhaarOtp,
  aadhaarOtpNotice,
  setAadhaarOtpNotice,
  aadhaarStatus,
  panNumber,
  setPanNumber,
  panImage,
  setPanImage,
  panStatus,
  gstNumber,
  setGstNumber,
  gstCertificate,
  setGstCertificate,
  gstStatus,
  selfieFile,
  setSelfieFile,
  selfieStatus,
  documentMessages,
  setDocumentMessage,
  isBusinessSeller,
  canVerifyPan,
  canVerifyGst,
  canUploadSelfie,
  isLoading,
  onSendAadhaarOtp,
  onVerifyAadhaarOtp,
  onVerifyPan,
  onVerifyGst,
  onUploadSelfie,
  confirmed,
  setConfirmed,
}) {
  return (
    <div className="mx-auto mt-5 grid w-full max-w-[1320px] items-stretch gap-5 lg:grid-cols-2 xl:grid-cols-3">
      <DocumentCard
        title="Aadhaar Card"
        subtitle="Verify OTP sent to Aadhaar-linked mobile"
        status={getKycStatusLabel(aadhaarStatus)}
        StatusIcon={aadhaarStatus === 'otp_sent' ? Clock3 : undefined}
      >
        {aadhaarStatus !== 'verified' && (
          <>
            <div className="grid gap-3 sm:grid-cols-[1fr_160px] lg:grid-cols-[1fr_170px]">
              <LabeledInput
                label="Aadhaar Number"
                placeholder="Enter 12-digit Aadhaar number"
                Icon={CreditCard}
                value={aadhaarNumber}
                onChange={(value) => {
                  setAadhaarNumber(value.replace(/\D/g, '').slice(0, 12));
                  setAadhaarOtpNotice('');
                  setDocumentMessage('aadhaar', '');
                }}
                inputMode="numeric"
              />
              <div className="pt-[29px]">
                <KycActionButton disabled={isLoading || aadhaarNumber.replace(/\D/g, '').length !== 12} onClick={onSendAadhaarOtp}>
                  {aadhaarStatus === 'otp_sent' ? 'Resend OTP' : 'Send OTP'}
                </KycActionButton>
              </div>
            </div>
            {aadhaarStatus === 'otp_sent' && (
              <div className="grid gap-3 sm:grid-cols-[1fr_160px] lg:grid-cols-[1fr_170px]">
                <LabeledInput
                  label="Aadhaar OTP"
                  placeholder="Enter 6-digit OTP"
                  Icon={ShieldCheck}
                  value={aadhaarOtp}
                  onChange={(value) => {
                    setAadhaarOtp(value.replace(/\D/g, '').slice(0, 6));
                    setDocumentMessage('aadhaar', '');
                  }}
                  inputMode="numeric"
                  type="password"
                  autoComplete="one-time-code"
                />
                <div className="pt-[29px]">
                  <KycActionButton disabled={isLoading || aadhaarOtp.length !== 6} onClick={onVerifyAadhaarOtp}>
                    Verify OTP
                  </KycActionButton>
                </div>
              </div>
            )}
            {aadhaarOtpNotice && (
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[#15803d]">
                <Check className="size-4 shrink-0" />
                <span>{aadhaarOtpNotice}</span>
              </div>
            )}
          </>
        )}
        {aadhaarStatus === 'verified' && (
          <LabeledInput
            label="Aadhaar Number"
            placeholder="Enter 12-digit Aadhaar number"
            Icon={CreditCard}
            value={aadhaarNumber}
            onChange={(value) => {
              setAadhaarNumber(value.replace(/\D/g, '').slice(0, 12));
              setAadhaarOtpNotice('');
              setDocumentMessage('aadhaar', '');
            }}
            inputMode="numeric"
          />
        )}
        <DocumentMessage message={documentMessages.aadhaar} />
      </DocumentCard>

      <DocumentCard title="PAN Card" subtitle="Required for tax purposes" status={getKycStatusLabel(panStatus)}>
        {panStatus === 'verified' ? (
          <VerifiedDocumentNotice title="PAN card verified" detail={panNumber} />
        ) : (
          <>
            <UploadBox
              Icon={ImageIcon}
              title="Upload PAN card"
              subtitle="JPG, PNG or PDF up to 5MB"
              accept="image/png,image/jpeg,application/pdf"
              file={panImage}
              onFileChange={(file) => {
                setPanImage(file);
                setDocumentMessage('pan', '');
              }}
            />
            {panImage && (
              <>
                <LabeledInput
                  label="PAN Number"
                  placeholder="Enter PAN Number"
                  Icon={CreditCard}
                  value={panNumber}
                  onChange={(value) => {
                    setPanNumber(value.toUpperCase().slice(0, 10));
                    setDocumentMessage('pan', '');
                  }}
                  disabled={!canVerifyPan}
                />
                <KycActionButton disabled={isLoading || !canVerifyPan} onClick={onVerifyPan}>
                  Verify PAN
                </KycActionButton>
              </>
            )}
          </>
        )}
        <DocumentMessage message={documentMessages.pan} />
      </DocumentCard>

      {isBusinessSeller && (
        <DocumentCard title="GST Certificate" subtitle="Business requirement" status={getKycStatusLabel(gstStatus)}>
          {gstStatus === 'verified' ? (
            <VerifiedDocumentNotice title="GST certificate verified" detail={gstNumber} />
          ) : (
            <>
              <UploadBox
                Icon={FileUp}
                title="Upload GST certificate"
                subtitle="JPG, PNG or PDF up to 5MB"
                accept="image/png,image/jpeg,application/pdf"
                file={gstCertificate}
                onFileChange={(file) => {
                  setGstCertificate(file);
                  setDocumentMessage('gst', '');
                }}
              />
              {gstCertificate && (
                <>
                  <LabeledInput
                    label="GSTIN"
                    placeholder="Enter GSTIN Number"
                    Icon={ReceiptText}
                    value={gstNumber}
                    onChange={(value) => {
                      setGstNumber(value.toUpperCase().slice(0, 15));
                      setDocumentMessage('gst', '');
                    }}
                    disabled={!canVerifyGst}
                  />
                  <KycActionButton disabled={isLoading || !canVerifyGst} onClick={onVerifyGst}>
                    Verify GST
                  </KycActionButton>
                </>
              )}
            </>
          )}
          <DocumentMessage message={documentMessages.gst} />
        </DocumentCard>
      )}

      <section className="grid gap-4 rounded-[8px] border border-[#d8e0dc] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] sm:p-6 lg:col-span-2 lg:grid-cols-[56px_1fr] lg:items-center xl:col-span-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e4f2e9] text-[#10233f] sm:size-12">
          <UserRound className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-semibold leading-tight text-[#10233f] sm:text-[21px]">Selfie Verification</h2>
              <p className="mt-1 text-[14px] leading-5 text-[#64748b]">Open your camera and capture a clear selfie.</p>
            </div>
            <StatusBadge label={getKycStatusLabel(selfieStatus)} />
          </div>
          {selfieStatus === 'verified' ? (
            <div className="mt-4">
              <VerifiedDocumentNotice title="Selfie verified" detail="Identity photo captured successfully" />
            </div>
          ) : (
            <SelfieCapture
              canUploadSelfie={canUploadSelfie}
              isLoading={isLoading}
              selfieFile={selfieFile}
              setSelfieFile={(file) => {
                setSelfieFile(file);
                setDocumentMessage('selfie', '');
              }}
              onUploadSelfie={onUploadSelfie}
            />
          )}
          <DocumentMessage message={documentMessages.selfie} />
        </div>
      </section>

      <div className="lg:col-span-2 xl:col-span-3">
        <AgreementCheckbox confirmed={confirmed} setConfirmed={setConfirmed} />
      </div>
    </div>
  );
}

function getKycStatusLabel(status) {
  if (status === 'verified') {
    return 'Verified';
  }

  if (status === 'otp_sent') {
    return 'OTP Sent';
  }

  return 'Pending';
}

function getResponseDocumentNumber(response, type) {
  const candidates =
    type === 'pan'
      ? [
          response?.extractedPan,
          response?.pan,
          response?.panNumber,
          response?.ocr?.pan,
          response?.ocr?.panNumber,
          response?.data?.extractedPan,
          response?.data?.pan,
          response?.data?.panNumber,
        ]
      : [
          response?.extractedGst,
          response?.extractedGstin,
          response?.gst,
          response?.gstNumber,
          response?.gstin,
          response?.ocr?.gst,
          response?.ocr?.gstNumber,
          response?.ocr?.gstin,
          response?.data?.extractedGst,
          response?.data?.extractedGstin,
          response?.data?.gst,
          response?.data?.gstNumber,
          response?.data?.gstin,
        ];

  for (const candidate of candidates) {
    const normalizedValue = normalizeDocumentNumber(candidate);

    if (type === 'pan' && /^[A-Z]{5}\d{4}[A-Z]$/.test(normalizedValue)) {
      return normalizedValue;
    }

    if (type === 'gst' && isValidGstin(normalizedValue)) {
      return normalizedValue;
    }
  }

  return '';
}

async function extractDocumentNumberFromUpload(file, type, expectedNumber = '', { optional = false } = {}) {
  if (!isImageUpload(file)) {
    return '';
  }

  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');

    try {
      const result = await worker.recognize(file);
      return getDocumentNumberFromText(result?.data?.text, type, expectedNumber);
    } finally {
      await worker.terminate();
    }
  } catch {
    if (optional) {
      return '';
    }

    throw new Error(type === 'pan' ? 'Unable to read PAN card. Upload a clear PAN card image and try again.' : 'Unable to read GST certificate. Upload a clear GST certificate image and try again.');
  }
}

function getDocumentNumberFromText(text, type, expectedNumber = '') {
  const normalizedText = normalizeDocumentNumber(text);
  const normalizedExpectedNumber = normalizeDocumentNumber(expectedNumber);

  if (type === 'pan') {
    if (hasTolerantDocumentMatch(normalizedText, normalizedExpectedNumber)) {
      return normalizedExpectedNumber;
    }

    const extractedPan = normalizedText.match(/[A-Z]{5}\d{4}[A-Z]/)?.[0] || '';
    return extractedPan;
  }

  if (hasTolerantDocumentMatch(normalizedText, normalizedExpectedNumber)) {
    return normalizedExpectedNumber;
  }

  const extractedGst = normalizedText.match(/\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]/)?.[0] || '';
  return extractedGst;
}

function hasTolerantDocumentMatch(text, expectedNumber) {
  if (!text || !expectedNumber) {
    return false;
  }

  for (let index = 0; index <= text.length - expectedNumber.length; index += 1) {
    const candidate = text.slice(index, index + expectedNumber.length);

    if (isTolerantDocumentMatch(candidate, expectedNumber)) {
      return true;
    }
  }

  return false;
}

function isTolerantDocumentMatch(candidate, expectedNumber) {
  if (candidate.length !== expectedNumber.length) {
    return false;
  }

  return [...expectedNumber].every((expectedCharacter, index) =>
    areDocumentCharactersEquivalent(candidate[index], expectedCharacter)
  );
}

function areDocumentCharactersEquivalent(actualCharacter, expectedCharacter) {
  if (actualCharacter === expectedCharacter) {
    return true;
  }

  const equivalents = {
    0: ['O', 'Q', 'D'],
    O: ['0', 'Q', 'D'],
    1: ['I', 'L'],
    I: ['1', 'L'],
    2: ['Z'],
    Z: ['2'],
    5: ['S'],
    S: ['5'],
    8: ['B'],
    B: ['8'],
  };

  return equivalents[expectedCharacter]?.includes(actualCharacter) || false;
}

function isImageUpload(file) {
  return Boolean(file?.type?.startsWith('image/'));
}

function normalizeDocumentNumber(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function isValidGstin(value) {
  const normalizedValue = normalizeDocumentNumber(value);
  const stateCode = normalizedValue.slice(0, 2);
  const validStateCodes = new Set([
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '29',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '38',
    '97',
  ]);

  return /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/.test(normalizedValue) && validStateCodes.has(stateCode);
}

function getKycApiErrorMessage(error) {
  return (
    String(error?.payload?.error || error?.payload?.message || '').trim() ||
    error?.message ||
    'Unable to verify GST certificate. Please try again.'
  );
}

function PayoutBilling({ confirmed, setConfirmed }) {
  return (
    <div className="mx-auto mt-5 w-full max-w-[1060px]">
      <div className="grid gap-5 lg:grid-cols-[1fr_52px_1fr] lg:items-stretch">
        <PayoutCard
          title="Bank Details (For Payouts)"
          subtitle="Provide your bank details to receive payments"
          Icon={ReceiptText}
        >
          <PayoutInput label="Account Holder Name" placeholder="Enter account holder name" />
          <PayoutInput label="Account Number" placeholder="Enter account number" inputMode="numeric" />
          <PayoutInput label="Re-enter Account Number" placeholder="Re-enter account number" inputMode="numeric" />
          <PayoutInput label="IFSC Code" placeholder="E.g. SBIN0001234" actionLabel="Verify IFSC" />
          <div className="mt-1 flex min-h-[44px] items-center gap-3 rounded-[6px] bg-[#eef6f0] px-4 text-[13px] font-medium text-[#0f6b42]">
            <Check className="size-4 shrink-0" />
            <span>Bank details will be verified securely.</span>
          </div>
        </PayoutCard>

        <div className="relative hidden items-center justify-center lg:flex">
          <span className="absolute left-1/2 top-6 h-[calc(100%-48px)] w-px -translate-x-1/2 bg-[#d8e0dc]" />
          <span className="relative z-10 flex size-10 items-center justify-center rounded-full border border-[#d8e0dc] bg-white text-[13px] font-medium text-[#10233f]">
            OR
          </span>
        </div>

        <PayoutCard title="UPI Details" subtitle="Receive payments directly in your UPI account" Icon={FileUp}>
          <PayoutInput label="UPI ID" placeholder="Enter UPI ID (e.g. username@upi)" />
          <div className="mt-5 flex min-h-[44px] items-center gap-3 rounded-[6px] bg-[#eef6f0] px-4 text-[13px] font-medium text-[#0f6b42]">
            <ShieldCheck className="size-4 shrink-0" />
            <span>UPI ID should be active and linked to your bank account.</span>
          </div>
        </PayoutCard>
      </div>
      <AgreementCheckbox confirmed={confirmed} setConfirmed={setConfirmed} />
    </div>
  );
}

function DocumentCard({ title, subtitle, status, StatusIcon, children }) {
  return (
    <section className="h-full rounded-[8px] border border-[#d8e0dc] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold leading-tight text-[#10233f] sm:text-[21px]">{title}</h2>
          <p className="mt-2 text-[14px] text-[#64748b] sm:text-[15px]">{subtitle}</p>
        </div>
        <StatusBadge label={status} Icon={StatusIcon} />
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function StatusBadge({ label, Icon }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#eef5ef] px-3 py-1.5 text-[13px] font-semibold text-[#4d9272] sm:text-[14px]">
      {Icon && <Icon className="size-3.5" />}
      {label}
    </span>
  );
}

function DocumentMessage({ message }) {
  if (!message) {
    return null;
  }

  const error = isErrorMessage(message);

  return (
    <div
      className={[
        'rounded-[8px] border bg-white px-4 py-3 text-[14px] font-semibold shadow-[0_8px_18px_rgba(15,23,42,0.04)]',
        error ? 'border-[#fecaca] text-[#b91c1c]' : 'border-[#dbe6dd] text-[#15803d]',
      ].join(' ')}
    >
      {message}
    </div>
  );
}

function isErrorMessage(message) {
  return /invalid|wrong|mismatch|unable|upload|enter|verify .*before|required|failed|error|rejected|try again|not|clear/i.test(
    String(message || '')
  );
}

function VerifiedDocumentNotice({ title, detail }) {
  return (
    <div className="flex min-h-[132px] flex-col justify-center rounded-[8px] border border-[#b7dcc5] bg-[#f0fdf4] px-5 py-4 text-[#15803d]">
      <div className="flex items-center gap-3 text-[16px] font-semibold">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#15803d] text-white">
          <Check className="size-4" />
        </span>
        {title}
      </div>
      {detail && <p className="mt-3 pl-11 text-[14px] font-medium text-[#166534]">{detail}</p>}
    </div>
  );
}

function SelfieCapture({ canUploadSelfie, isLoading, selfieFile, setSelfieFile, onUploadSelfie }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [capturedPreview, setCapturedPreview] = useState('');

  useEffect(() => {
    if (!cameraOpen || capturedPreview) {
      return undefined;
    }

    let cancelled = false;

    async function startCamera() {
      setCameraError('');

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera is not available in this browser.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });

        if (cancelled) {
          stopStream(stream);
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setCameraError('Unable to open camera. Please allow camera permission and try again.');
      }
    }

    startCamera();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [cameraOpen, capturedPreview]);

  const revokeCapturedPreview = useCallback(() => {
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
      setCapturedPreview('');
    }
  }, [capturedPreview]);

  useEffect(() => {
    return () => {
      stopCamera();
      revokeCapturedPreview();
    };
  }, [revokeCapturedPreview]);

  function openCamera() {
    if (!canUploadSelfie) {
      return;
    }

    revokeCapturedPreview();
    setCapturedBlob(null);
    setCameraOpen(true);
  }

  function closeCamera() {
    stopCamera();
    setCameraOpen(false);
    setCameraError('');
    setCapturedBlob(null);
    revokeCapturedPreview();
  }

  function retakeSelfie() {
    revokeCapturedPreview();
    setCapturedBlob(null);
  }

  function captureSelfie() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setCameraError('Camera preview is not ready. Please try again.');
      return;
    }

    const sourceWidth = video.videoWidth || SELFIE_MAX_DIMENSION;
    const sourceHeight = video.videoHeight || SELFIE_MAX_DIMENSION;
    const scale = Math.min(1, SELFIE_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight));
    const width = Math.round(sourceWidth * scale);
    const height = Math.round(sourceHeight * scale);
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, sourceWidth, sourceHeight, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError('Unable to capture selfie. Please try again.');
          return;
        }

        stopCamera();
        setCapturedBlob(blob);
        setCapturedPreview(URL.createObjectURL(blob));
      },
      'image/jpeg',
      SELFIE_JPEG_QUALITY
    );
  }

  function useCapturedSelfie() {
    if (!capturedBlob) {
      return;
    }

    const file = new File([capturedBlob], `selfie-${Date.now()}.jpg`, { type: 'image/jpeg' });
    setSelfieFile(file);
    setCameraOpen(false);
    setCameraError('');
  }

  function stopCamera() {
    if (streamRef.current) {
      stopStream(streamRef.current);
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px]">
      <button
        type="button"
        disabled={!canUploadSelfie || isLoading}
        className={[
          'flex min-h-[46px] items-center gap-3 rounded-[8px] border border-[#d8e0dc] bg-white px-4 text-left text-[14px] font-medium transition',
          canUploadSelfie ? 'text-[#475569] hover:border-[#0b8a4b]' : 'cursor-not-allowed text-[#9ca3af] opacity-70',
        ].join(' ')}
        onClick={openCamera}
      >
        <Camera className="size-4 shrink-0 text-[#10233f]" />
        <span className="truncate">{selfieFile?.name || 'Take selfie'}</span>
      </button>
      <KycActionButton disabled={isLoading || !canUploadSelfie || !selfieFile} onClick={onUploadSelfie}>
        Upload Selfie
      </KycActionButton>

      {cameraOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 px-4 py-6">
          <div className="w-full max-w-[520px] overflow-hidden rounded-[12px] bg-white shadow-[0_28px_80px_rgba(0,0,0,0.24)]">
            <div className="flex items-center justify-between border-b border-[#e5ece8] px-5 py-4">
              <div>
                <h3 className="text-[18px] font-semibold text-[#10233f]">Selfie verification</h3>
                <p className="mt-1 text-[13px] text-[#64748b]">Center your face and capture a clear photo.</p>
              </div>
              <button
                type="button"
                aria-label="Close camera"
                className="flex size-9 items-center justify-center rounded-full border border-[#d8e0dc] text-[#10233f] transition hover:border-[#0b8a4b]"
                onClick={closeCamera}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="bg-[#0f172a] p-4">
              <div className="relative mx-auto aspect-[4/5] max-h-[520px] overflow-hidden rounded-[10px] bg-black">
                {capturedPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={capturedPreview} alt="Captured selfie preview" className="h-full w-full object-cover" />
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                )}
                {!capturedPreview && !cameraError && (
                  <div className="pointer-events-none absolute inset-6 rounded-[50%] border-2 border-white/70" />
                )}
                {cameraError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 px-6 text-center text-[14px] font-semibold text-white">
                    {cameraError}
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="grid gap-3 px-5 py-4 sm:grid-cols-2">
              {capturedPreview ? (
                <>
                  <button
                    type="button"
                    className="flex min-h-[46px] items-center justify-center gap-2 rounded-[8px] border border-[#cbded1] bg-white text-[14px] font-semibold text-[#10233f] transition hover:border-[#0b8a4b]"
                    onClick={retakeSelfie}
                  >
                    <RefreshCw className="size-4" />
                    Retake
                  </button>
                  <button
                    type="button"
                    className="flex min-h-[46px] items-center justify-center gap-2 rounded-[8px] bg-[#0b8a4b] text-[14px] font-semibold text-white transition hover:bg-[#08723f]"
                    onClick={useCapturedSelfie}
                  >
                    <Check className="size-4" />
                    Use Photo
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="flex min-h-[46px] items-center justify-center rounded-[8px] border border-[#cbded1] bg-white text-[14px] font-semibold text-[#10233f] transition hover:border-[#0b8a4b]"
                    onClick={closeCamera}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={Boolean(cameraError)}
                    className="flex min-h-[46px] items-center justify-center gap-2 rounded-[8px] bg-[#0b8a4b] text-[14px] font-semibold text-white transition hover:bg-[#08723f] disabled:cursor-not-allowed disabled:bg-[#9fc7b3]"
                    onClick={captureSelfie}
                  >
                    <Camera className="size-4" />
                    Capture
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function stopStream(stream) {
  stream.getTracks().forEach((track) => track.stop());
}

function KycActionButton({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="flex min-h-[44px] items-center justify-center rounded-[8px] bg-[#0b8a4b] px-4 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(11,138,75,0.16)] transition hover:-translate-y-px hover:bg-[#08723f] active:scale-[0.99] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#9fc7b3] disabled:shadow-none"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function UploadBox({ Icon, title, subtitle, file, onFileChange, accept }) {
  return (
    <label
      className="flex min-h-[118px] w-full cursor-pointer flex-col items-center justify-center rounded-[8px] border border-dashed border-[#bfc8c3] px-4 text-center text-[#475569] transition hover:border-[#0b8a4b] hover:bg-[#f8faf7] sm:min-h-[126px]"
    >
      <Icon className="size-8 text-[#10233f]" />
      <span className="mt-3 max-w-full truncate text-[15px] font-semibold">{file?.name || title}</span>
      <span className="mt-1.5 text-[13px] text-[#64748b]">{subtitle}</span>
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => onFileChange(event.target.files?.[0] || null)}
      />
    </label>
  );
}

function LabeledInput({ label, placeholder, Icon, value, onChange, inputMode, type = 'text', autoComplete, disabled = false }) {
  return (
    <label className="block">
      <span className="mb-2.5 block text-[13px] font-semibold text-[#10233f]">{label}</span>
      <span
        className={[
          'flex min-h-[46px] items-center rounded-[8px] border border-[#d8e0dc] bg-white px-4 transition focus-within:border-[#0b8a4b] focus-within:shadow-[0_0_0_4px_rgba(11,138,75,0.08)]',
          disabled ? 'opacity-70' : '',
        ].join(' ')}
      >
        <Icon className="mr-3 size-4 shrink-0 text-[#9aa5a0]" />
        <input
          type={type}
          value={value}
          inputMode={inputMode}
          autoComplete={autoComplete}
          disabled={disabled}
          className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#10233f] outline-none placeholder:text-[#64748b]"
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}

function PayoutCard({ title, subtitle, Icon, children }) {
  return (
    <section className="rounded-[8px] border border-[#d8e0dc] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex items-start gap-4">
        {Icon && (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#e4f2e9] text-[#0b8a4b]">
            <Icon className="size-6" />
          </span>
        )}
        <div>
          <h2 className="text-[19px] font-semibold leading-tight text-[#10233f] sm:text-[20px]">{title}</h2>
          {subtitle && <p className="mt-2 text-[13px] leading-5 text-[#64748b] sm:text-[14px]">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5 space-y-3.5">{children}</div>
    </section>
  );
}

function PayoutInput({ label, placeholder = '', actionLabel = '', inputMode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#10233f]">{label}</span>
      <span className="flex min-h-[46px] items-center rounded-[8px] border border-[#d8e0dc] bg-white px-4 transition focus-within:border-[#0b8a4b] focus-within:shadow-[0_0_0_4px_rgba(11,138,75,0.08)]">
        <input
          inputMode={inputMode}
          className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#10233f] outline-none placeholder:text-[#64748b]"
          placeholder={placeholder}
        />
        {actionLabel && (
          <button
            type="button"
            className="ml-4 shrink-0 rounded-[8px] border border-[#0b8a4b] px-4 py-2 text-[13px] font-semibold text-[#0b8a4b] transition hover:bg-[#eef6f0]"
          >
            {actionLabel}
          </button>
        )}
      </span>
    </label>
  );
}

function AgreementCheckbox({ confirmed, setConfirmed }) {
  return (
    <label className="mt-5 flex items-start gap-3 px-1 py-2 text-[13px] leading-6 text-[#475569] sm:text-[14px]">
      <span
        className={[
          'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[4px] border-[2px]',
          confirmed ? 'border-[#0b8a4b] bg-[#0b8a4b] text-white' : 'border-[#94a3b8] bg-transparent text-transparent',
        ].join(' ')}
      >
        <Check className="size-4" />
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={confirmed}
        onChange={(event) => setConfirmed(event.target.checked)}
      />
      <span>I confirm that the details provided are accurate and I agree to the Terms of Service and Privacy Policy.</span>
    </label>
  );
}
