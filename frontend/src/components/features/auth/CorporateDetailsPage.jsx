import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CorporateDetailsForm } from './CorporateDetailsForm';
import { OnboardingStepProgress } from './OnboardingStepProgress';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';

export function CorporateDetailsPage() {
  return (
    <>
      <MarketingHeader active="" />
      <main className="min-h-screen bg-[#f8fafc] pt-[86px] font-sans text-[#111827]">
        <div className="mx-auto max-w-[1280px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <div className="mb-8">
            <OnboardingStepProgress activeStep={3} accountType="corporate" />
          </div>

          <header className="mb-8">
            <div className="flex items-start gap-5">
              <Link
                href="/sign_in/account-type"
                aria-label="Back to account type"
                className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-[10px] border border-[#e5e7eb] bg-white text-[#111827] shadow-[0_12px_32px_rgba(15,23,42,0.06)] transition hover:-translate-y-px hover:border-[#15803d]/45 hover:text-[#15803d]"
              >
                <ArrowLeft className="size-5" />
              </Link>

              <div>
                <div className="text-[14px] font-semibold uppercase tracking-[0.08em] text-[#15803d]">
                  Step 3 of 5
                </div>
                <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-[-0.8px] text-[#111827] sm:text-[38px]">
                  Corporate Details
                </h1>
                <p className="mt-4 text-[16px] font-medium text-[#64748b] sm:text-[17px]">
                  Please provide your business information to continue.
                </p>
              </div>
            </div>
          </header>

          <CorporateDetailsForm />
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}
