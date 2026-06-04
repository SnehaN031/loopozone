import { Check } from 'lucide-react';

const accountDetailLabels = {
  corporate: 'Corporate details',
  trader: 'Trader details',
  personal: 'Personal details',
};

export function getOnboardingSteps(accountType = '') {
  return [
    { number: 1, label: 'Details' },
    { number: 2, label: 'Account type' },
    { number: 3, label: accountDetailLabels[accountType] ?? 'Account details' },
    { number: 4, label: 'Verification' },
    { number: 5, label: 'Done' },
  ];
}

export function OnboardingStepProgress({ activeStep, accountType = '', steps }) {
  const visibleSteps = steps ?? getOnboardingSteps(accountType);

  return (
    <div className="hidden w-full min-w-0 items-start justify-center text-[14px] font-semibold text-[#64748b] sm:flex lg:text-[15px]">
      {visibleSteps.map(({ number, label }, index) => {
        const active = number === activeStep;
        const completed = number < activeStep;

        return (
          <div key={label} className="relative flex min-w-0 flex-1 flex-col items-center text-center">
            {index > 0 && (
              <span className="absolute right-1/2 top-5 h-px w-full bg-[#d7ded8] lg:top-[22px]" />
            )}
            <div className="relative z-10 flex min-w-0 flex-col items-center gap-2 bg-transparent px-1">
              <span
                className={[
                  'flex size-10 shrink-0 items-center justify-center rounded-full border text-[17px] transition lg:size-11 lg:text-[17px]',
                  active || completed
                    ? 'border-[#15803d] bg-[#15803d] text-white shadow-[0_8px_18px_rgba(21,128,61,0.16)]'
                    : 'border-[#d5dde4] bg-white text-[#0f2540]',
                ].join(' ')}
              >
                {completed ? <Check className="size-4" /> : number}
              </span>
              <span className={active || completed ? 'max-w-[130px] text-[#047a3f]' : 'max-w-[130px] text-[#64748b]'}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
