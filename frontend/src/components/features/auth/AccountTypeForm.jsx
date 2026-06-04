'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Factory, Handshake, Home, Tags, Truck } from 'lucide-react';
import { useState } from 'react';
import { signupUser } from '@/services/auth.service';
import { getSignupDraft, hasAuthSession, setAuthSession } from '@/services/client.service';
import { setSellerType } from '@/services/kyc.service';
import { OnboardingStepProgress } from './OnboardingStepProgress';

const intents = [
  {
    value: 'selling',
    title: 'Selling Materials',
    description: 'I have scrap to sell',
    Icon: Tags,
  },
  {
    value: 'buying',
    title: 'Buying Materials',
    description: 'I want to buy scrap',
    Icon: Handshake,
  },
];

const accountTypes = [
  {
    value: 'business',
    title: 'Corporate / Business',
    description: 'Offices, factories, or large facilities generating bulk scrap.',
    Icon: Factory,
  },
  {
    value: 'trader',
    title: 'Scrap Trader / Aggregator',
    description: 'Professional scrap collectors, kabadiwalas, or small yards.',
    Icon: Truck,
  },
  {
    value: 'household',
    title: 'Individual / Household',
    description: 'Personal recycling, home clearouts, and small quantities.',
    Icon: Home,
  },
];

export function AccountTypeForm() {
  const router = useRouter();
  const [intent, setIntent] = useState('');
  const [accountType, setAccountType] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const canContinue = Boolean(accountType);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canContinue) {
      return;
    }

    setIsLoading(true);
    setStatusMessage('');

    try {
      const draft = getSignupDraft();

      const sellerType = getSellerType(accountType);

      if (!hasAuthSession()) {
        if (!draft?.name || !draft?.email || !draft?.phone) {
          setStatusMessage('Complete your name, mobile number, and email before choosing account type.');
          setIsLoading(false);
          return;
        }

        const response = await signupUser({
          ...draft,
          sellerType,
        });
        setAuthSession(response);
      }

      await setSellerType(sellerType);

      router.push(getDetailsRoute(accountType));
    } catch (error) {
      setStatusMessage(error.message);
      setIsLoading(false);
    }
  }

  function handleAccountTypeClick(value) {
    setAccountType(value);
  }

  return (
    <section className="mx-auto w-full max-w-[1120px]" aria-labelledby="account-type-title">
      <OnboardingStepProgress activeStep={2} accountType={getProgressAccountType(accountType)} />

      <div className="mt-10">
        <h1
          id="account-type-title"
          className="text-[34px] font-semibold leading-tight tracking-[-0.8px] text-[#111827] sm:text-[38px]"
        >
          Create your account
        </h1>
        <p className="mt-4 text-[17px] text-[#6b7280]">Takes less than 2 minutes to get started</p>
      </div>

      <form className="mt-10" onSubmit={handleSubmit}>
        <fieldset>
          <legend className="text-[16px] font-semibold text-[#111827]">I want to</legend>
          <div className="mt-4 grid overflow-hidden rounded-[13px] border-[1.5px] border-[#d9d9d6] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.03)] md:grid-cols-2">
            {intents.map(({ value, title, description, Icon }) => {
              const selected = intent === value;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  className={[
                    'relative flex min-h-[96px] items-center gap-5 px-6 text-left transition hover:bg-[#f0fdf4] focus:outline-none focus:ring-4 focus:ring-inset focus:ring-[#15803d]/10',
                    value === 'buying' ? 'border-t border-[#e5e7eb] md:border-l md:border-t-0' : '',
                    selected
                      ? 'bg-[#f0fdf4] text-[#111827] shadow-[inset_0_0_0_2px_#15803d]'
                      : 'text-[#111827]',
                  ].join(' ')}
                  onClick={() => setIntent(value)}
                >
                  {selected && (
                    <span className="absolute right-5 top-5 flex size-7 items-center justify-center rounded-full bg-[#15803d] text-white">
                      <Check className="size-4" />
                    </span>
                  )}
                  <span
                    className={[
                      'flex size-12 shrink-0 items-center justify-center rounded-[12px] border',
                      selected ? 'border-[#15803d]/20 bg-white text-[#15803d]' : 'border-[#15803d]/15 bg-[#f0fdf4] text-[#15803d]',
                    ].join(' ')}
                  >
                    <Icon className="size-7" />
                  </span>
                  <span className="min-w-0 pr-8">
                    <span className="block text-[17px] font-semibold">{title}</span>
                    <span className="mt-1 block text-[15px] text-[#6b7280]">{description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-10">
          <legend className="text-[18px] font-semibold text-[#111827]">Choose your account type</legend>
          <p className="mt-2 text-[15px] text-[#6b7280]">
            Select the option that best describes you. You can change this later.
          </p>

          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {accountTypes.map(({ value, title, description, Icon }) => {
              const selected = accountType === value;

              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  className={[
                    'relative flex min-h-[220px] flex-col rounded-[13px] border-[1.5px] bg-white p-7 text-left transition hover:-translate-y-px hover:border-[#15803d]/45 hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)]',
                    selected ? 'border-[#15803d] shadow-[0_0_0_3px_rgba(21,128,61,0.07)]' : 'border-[#dededb]',
                  ].join(' ')}
                  onClick={() => handleAccountTypeClick(value)}
                >
                  {selected && (
                    <span className="absolute right-5 top-5 flex size-7 items-center justify-center rounded-full bg-[#15803d] text-white">
                      <Check className="size-4" />
                    </span>
                  )}
                  <Icon className="size-10 text-[#15803d]" />
                  <span className="mt-6 block text-[21px] font-semibold leading-tight text-[#0f2a3d]">{title}</span>
                  <span className="mt-3 block text-[16px] leading-7 text-[#52525b]">{description}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {statusMessage && (
          <div className="mt-7 rounded-[11px] border border-[#fecaca] bg-[#fef2f2] px-5 py-4 text-[15px] font-semibold text-[#b91c1c]">
            {statusMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={!canContinue || isLoading}
          className="mt-9 flex min-h-[58px] w-full items-center justify-center gap-4 rounded-[11px] bg-[#15803d] px-4 py-[14px] text-[18px] font-semibold text-white transition hover:-translate-y-px hover:bg-[#14532d] active:scale-[0.99] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Creating account' : 'Continue'}
          <ArrowRight className="size-5" />
        </button>

        <p className="mt-5 text-center text-[15px] text-[#6b7280]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#15803d] transition hover:text-[#14532d]">
            Sign in
          </Link>
        </p>
      </form>
    </section>
  );
}

function getDetailsRoute(accountType) {
  if (accountType === 'business') {
    return '/sign_in/corporate-details?account=corporate';
  }

  if (accountType === 'trader') {
    return '/sign_in/trader-details?account=trader';
  }

  return '/sign_in/personal-details?account=personal';
}

function getSellerType(accountType) {
  return accountType === 'household' ? 'individual' : 'business';
}

function getProgressAccountType(accountType) {
  if (accountType === 'business') {
    return 'corporate';
  }

  if (accountType === 'trader') {
    return 'trader';
  }

  if (accountType === 'household') {
    return 'personal';
  }

  return '';
}
