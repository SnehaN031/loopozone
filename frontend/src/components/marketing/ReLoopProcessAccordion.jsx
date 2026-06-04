'use client';

import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FilePlus2,
  IndianRupee,
  Layers,
  Scale,
  Search,
  Truck,
  Users,
} from 'lucide-react';
import { useState } from 'react';

const processSteps = [
  {
    title: 'Lead Generation',
    body: 'Scrap generators, aggregators, or businesses submit material availability through the ReLoop platform. The system captures material type, quantity, location, and compliance needs before moving the lead forward.',
    Icon: FilePlus2,
  },
  {
    title: 'Material Assessment',
    body: 'Our field team or verified partners inspect the material grade, quality, quantity, and documentation. Photos, estimated weight, and compliance checks are recorded digitally.',
    Icon: Search,
  },
  {
    title: 'Collection Scheduling',
    body: 'Pickup logistics are planned based on location, material volume, partner availability, and route efficiency. The generator receives a confirmed pickup slot with tracking updates.',
    Icon: CalendarDays,
  },
  {
    title: 'Pickup & Weighing',
    body: 'Authorized collection partners execute the pickup using digital weighbridges or certified scales. Material weight, photos, and GPS coordinates are captured for traceability.',
    Icon: Truck,
  },
  {
    title: 'Local Processing',
    body: 'Materials are routed to verified processing facilities for sorting, grading, dismantling, refurbishment, or recovery based on the material category and compliance requirements.',
    Icon: Scale,
  },
  {
    title: 'Payout Settlement',
    body: 'Sellers receive digital payouts based on verified weight, quality grade, and applicable market rates. Settlement is supported by transaction and material documentation.',
    Icon: IndianRupee,
  },
  {
    title: 'Buyer Matching',
    body: 'Processed materials are matched with verified buyers such as recyclers, manufacturers, or exporters. Buyer requirements and payment reliability are checked before assignment.',
    Icon: Layers,
  },
  {
    title: 'Final Delivery',
    body: 'Materials are delivered to buyers with certificates, transport records, and required compliance documents. End-to-end traceability supports audit readiness and responsible closure.',
    Icon: Users,
  },
];

export function ReLoopProcessAccordion({ steps = processSteps }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mx-auto mt-14 max-w-[1280px] overflow-hidden rounded-[14px] border border-[#dfe8e4] bg-white">
      {steps.map(({ title, body, Icon }, index) => {
        const open = index === openIndex;

        return (
          <article key={title} className={open ? 'border-l-4 border-[#08785f] bg-white' : 'bg-white'}>
            <button
              type="button"
              className={[
                'flex min-h-[76px] w-full items-center gap-4 border-b border-[#e5ece8] px-5 text-left transition sm:px-8',
                open ? 'bg-[#eef8f4]' : 'bg-white hover:bg-[#f8fbfa]',
              ].join(' ')}
              onClick={() => setOpenIndex(index)}
              aria-expanded={open}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#def5ed] text-[14px] font-semibold text-[#08785f]">
                {index + 1}
              </span>
              <Icon className="size-5 shrink-0 text-[#08785f]" />
              <h3 className="min-w-0 flex-1 text-[17px] font-semibold text-[#111827]">{title}</h3>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#08785f]">
                {open ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
              </span>
            </button>

            {open && (
              <div className="grid gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_240px] lg:items-center">
                <div>
                  <h4 className="text-[26px] font-semibold text-[#111827]">{title}</h4>
                  <p className="mt-5 max-w-[760px] text-[17px] leading-8 text-[#475569]">{body}</p>
                  <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#def5ed] px-4 py-2 text-[13px] font-semibold text-[#08785f]">
                    <span className="size-2 rounded-full bg-[#08785f]" />
                    Step {index + 1} of {steps.length}
                  </span>
                </div>
                <span className="mx-auto flex size-32 items-center justify-center rounded-full bg-[#def5ed] text-[#08785f] sm:size-36">
                  <Icon className="size-14" />
                </span>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
