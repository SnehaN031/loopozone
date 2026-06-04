'use client';

import { ChevronRight, Gauge, IndianRupee, ShieldCheck, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

const defaultSteps = [
  { label: 'Pickup', Icon: Truck },
  { label: 'Process', Icon: Gauge },
  { label: 'Payout', Icon: IndianRupee },
  { label: 'Proof', Icon: ShieldCheck },
];

export function AnimatedWorkflowSteps({ steps = defaultSteps, interval = 2000 }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!steps.length) {
      return undefined;
    }

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % steps.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, steps.length]);

  if (!steps.length) {
    return null;
  }

  return (
    <div className="mx-auto mt-12 w-full max-w-[720px] sm:mt-14">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] sm:items-start sm:gap-4 lg:gap-5">
        {steps.map(({ label, Icon }, index) => {
          const active = index === activeIndex;

          return (
            <StepItem key={label} label={label} Icon={Icon} active={active} showArrow={index < steps.length - 1} />
          );
        })}
      </div>
    </div>
  );
}

function StepItem({ label, Icon, active, showArrow }) {
  return (
    <>
      <div className="flex min-w-0 flex-col items-center text-center">
        <span
          className={[
            'flex size-16 items-center justify-center rounded-full transition-all duration-700 ease-out sm:size-20',
            active
              ? 'scale-110 border-2 border-[#117d63] bg-[#117d63] text-white opacity-100 shadow-[0_20px_55px_rgba(8,120,95,0.32)]'
              : 'scale-100 border-2 border-[#17a77d] bg-white text-[#08785f] opacity-95 shadow-none',
          ].join(' ')}
        >
          <Icon className="size-6 transition-all duration-700 ease-out sm:size-7" />
        </span>
        <p
          className={[
            'mt-3 text-[15px] font-semibold leading-tight transition-all duration-700 ease-out sm:text-[16px]',
            active ? 'scale-105 text-[#08785f] opacity-100' : 'scale-100 text-[#334155] opacity-90',
          ].join(' ')}
        >
          {label}
        </p>
      </div>

      {showArrow && (
        <div className="flex items-center justify-center text-[#9edaca] sm:h-20">
          <ChevronRight className="size-5 sm:size-6" />
          <ChevronRight className="-ml-3 size-5 sm:size-6" />
        </div>
      )}
    </>
  );
}
