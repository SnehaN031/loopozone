'use client';

import Link from 'next/link';
import { CheckCircle2, PlusCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { OnboardingStepProgress } from './OnboardingStepProgress';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';

const accountLabels = {
  corporate: 'Corporate / Business',
  trader: 'Scrap Trader / Aggregator',
  personal: 'Individual / Household',
};

export function SignInSuccessPage() {
  const [accountType, setAccountType] = useState('');

  useEffect(() => {
    const from = new URLSearchParams(window.location.search).get('from');
    if (from === 'trader' || from === 'personal' || from === 'corporate') {
      setAccountType(from);
    }
  }, []);

  return (
    <>
      <MarketingHeader active="" />
      <main className="min-h-screen bg-[#f8fafc] px-4 pb-8 pt-[118px] font-sans text-[#111827] sm:px-6 lg:px-8">
        <section className="mx-auto max-w-[980px]">
          <OnboardingStepProgress activeStep={5} accountType={accountType} />

          <div className="mt-10 rounded-[22px] border border-[#e5e7eb] bg-white p-7 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10 lg:p-12">
            <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#e8f7ef] text-[#15803d]">
              <CheckCircle2 className="size-11" />
            </div>

            <div className="mt-8 text-[14px] font-semibold uppercase tracking-[0.1em] text-[#15803d]">
              Step 5 of 5
            </div>

            <h1 className="mt-4 text-[34px] font-semibold leading-tight tracking-[-0.8px] text-[#111827] sm:text-[42px]">
              Submitted for review
            </h1>

            <p className="mx-auto mt-4 max-w-[560px] text-[17px] leading-8 text-[#64748b]">
              Your {accountLabels[accountType] ?? 'account'} profile and KYC documents have been submitted for admin review. You can log in
              after approval.
            </p>

            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              <Link
                href="/sign_in/account-type"
                className="flex min-h-[56px] items-center justify-center gap-3 rounded-[11px] border-[1.5px] border-[#15803d] bg-white px-5 text-[16px] font-semibold text-[#15803d] transition hover:-translate-y-px hover:bg-[#f0fdf4]"
              >
                <PlusCircle className="size-5" />
                Create another account
              </Link>

              <Link
                href="/login"
                className="flex min-h-[56px] items-center justify-center gap-3 rounded-[11px] bg-[#15803d] px-5 text-[16px] font-semibold text-white transition hover:-translate-y-px hover:bg-[#14532d]"
              >
                <X className="size-5" />
                Close
              </Link>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
