import Link from 'next/link';
import {
  BatteryCharging,
  CheckSquare,
  ClipboardCheck,
  Gauge,
  IndianRupee,
  Layers,
  Package,
  Recycle,
  ShieldCheck,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { AnimatedWorkflowSteps } from '@/components/marketing/AnimatedWorkflowSteps';
import { ReLoopProcessAccordion } from '@/components/marketing/ReLoopProcessAccordion';

export const metadata = {
  title: 'Loopozone | Circular Economy Network',
  description: 'Loopozone connects scrap pickup, processing, payout, and proof through the ReLoop circular economy platform.',
};

const infrastructureCards = [
  {
    title: 'Scrap Aggregation',
    body: 'Pan-India network for organised scrap collection from businesses, dealers, and institutions.',
    Icon: Truck,
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Verified Material Movement',
    body: 'Ensuring secure, verified, and compliant movement of materials across the network.',
    Icon: Layers,
    image: 'https://images.unsplash.com/photo-1501700493788-fa1a4fc9fe62?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Local Processing',
    body: 'Partnering with approved facilities for sorting, dismantling, and value recovery.',
    Icon: Wrench,
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    featured: true,
  },
  {
    title: 'Audit-ready Tracking',
    body: 'End-to-end traceability with digital records for compliance and reporting.',
    Icon: ClipboardCheck,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  },
];

const impactStats = [
  { value: '40', title: 'Faster Processing', body: 'Optimised operations reduce turnaround time significantly.' },
  { value: '100', title: 'Traceable Transactions', body: 'End-to-end visibility from pickup to payout with complete proof.' },
  { value: '1,000', title: 'Partner Network', body: 'A growing ecosystem of verified partners across India.' },
  { value: 'AI-driven', title: 'AI-enabled', body: 'Data and intelligence that power smarter, responsible choices.' },
];

const operationStats = [
  { label: 'Collections', value: '24', unit: 'MT' },
  { label: 'Shipments', value: '1', unit: '' },
  { label: 'Processors', value: '325', unit: '' },
  { label: 'Buyers', value: '146', unit: '' },
];

const materialBreakdown = [
  { label: 'Plastic', value: '54%' },
  { label: 'Paper', value: '22%' },
  { label: 'Metal', value: '16%' },
  { label: 'Others', value: '8%' },
];

const materials = [
  {
    title: 'Ferrous Scrap',
    category: 'Metals',
    Icon: Package,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Non-Ferrous',
    category: 'Metals',
    Icon: Package,
    image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'E-Waste',
    category: 'Electronics',
    Icon: Zap,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Industrial Scrap',
    category: 'Mixed',
    Icon: Wrench,
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Battery Waste',
    category: 'Hazardous',
    Icon: BatteryCharging,
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Plastic Waste',
    category: 'Polymers',
    Icon: Recycle,
    image: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Packaging',
    category: 'Paper & Cardboard',
    Icon: Package,
    image: 'https://images.unsplash.com/photo-1605600659873-d808a13e4d2a?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Corporate Disposal',
    category: 'Mixed',
    Icon: ShieldCheck,
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
  },
];

export default function HomeRoute() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#171d21]">
      <MarketingHeader active="Home" />

      <section id="home" className="relative min-h-screen overflow-hidden pt-[86px] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=2200&q=85)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#061c14]/95 via-[#061c14]/70 to-[#061c14]/28" />
        <div className="relative mx-auto flex min-h-[calc(100vh-86px)] w-full max-w-[1510px] items-center px-5 py-16 sm:px-8 lg:px-12">
          <div className="max-w-[860px]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8ee5cc] sm:text-[14px]">India&apos;s circular economy network</p>
            <h1 className="mt-7 text-[56px] font-semibold leading-[0.96] tracking-[-1px] sm:text-[84px] lg:text-[116px]">
              Got <span className="inline-block rotate-[-2deg] rounded-[10px] bg-[#0b7a60] px-4">Scrap?</span>
              <br />
              We&apos;ll Loop
              <br />
              It Back.
            </h1>
            <p className="mt-8 max-w-[680px] text-[18px] leading-8 text-white/76 sm:text-[22px]">
              From pickup to payout to proof, ReLoop handles it all.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link href="/sign_in" className="inline-flex min-h-[58px] items-center justify-center rounded-[10px] bg-[#08785f] px-8 text-[17px] font-semibold text-white transition hover:bg-[#065f4c]">
                Schedule a Pickup →
              </Link>
              <Link href="/sign_in/account-type" className="inline-flex min-h-[58px] items-center justify-center rounded-[10px] border border-white/40 px-8 text-[17px] font-semibold text-white transition hover:bg-white/10">
                Join as Partner
              </Link>
            </div>
          </div>
        </div>
        <span className="absolute bottom-10 right-8 hidden origin-center rotate-90 text-[12px] uppercase tracking-[0.25em] text-white/55 lg:block">Scroll</span>
      </section>

      <InfrastructureSection />
      <ImpactSection />
      <ActionSection />
      <ProcessSection />
      <MaterialsSection />
      <CallToAction />
      <MarketingFooter />

    </main>
  );
}

function SectionTitle({ eyebrow, title, accent }) {
  return (
    <div className="text-center">
      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0f9b78]">{eyebrow}</p>
      <h2 className="mt-4 text-[38px] font-semibold leading-tight tracking-[-0.8px] text-[#171d21] sm:text-[56px]">
        {title} <span className="text-[#17a77d]">{accent}</span>
      </h2>
      <span className="mx-auto mt-5 block h-[3px] w-12 rounded-full bg-[#17a77d]" />
    </div>
  );
}

function InfrastructureSection() {
  return (
    <section id="about" className="bg-[#f7fbfa] px-5 py-24 sm:px-8 lg:px-12">
      <SectionTitle eyebrow="What we do" title="Circular Economy" accent="Infrastructure" />
      <div className="mx-auto mt-14 grid max-w-[1510px] gap-7 sm:grid-cols-2 xl:grid-cols-4">
        {infrastructureCards.map(({ title, body, Icon, image, featured }) => (
          <article
            key={title}
            className={[
              'overflow-hidden rounded-[14px] border bg-white shadow-[0_12px_36px_rgba(15,23,42,0.04)]',
              featured ? 'border-[#8bdac5] shadow-[0_30px_80px_rgba(8,120,95,0.18)]' : 'border-[#dfe8e4]',
            ].join(' ')}
          >
            <div className="h-[190px] bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
            <div className="p-7">
              <span className={featured ? 'flex size-14 items-center justify-center rounded-[10px] bg-[#08785f] text-white' : 'flex size-14 items-center justify-center rounded-[10px] bg-[#e1f6ef] text-[#08785f]'}>
                <Icon className="size-7" />
              </span>
              <h3 className="mt-7 text-[22px] font-semibold leading-snug">{title}</h3>
              <p className="mt-4 text-[16px] leading-7 text-[#64748b]">{body}</p>
              <Link href="#platform" className="mt-5 inline-flex text-[16px] font-semibold text-[#08785f]">
                Learn more →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ImpactSection() {
  return (
    <section className="bg-[#062416] px-5 py-24 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1510px]">
        <div className="text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#7ce3d1]">Why Loopozone</p>
          <h2 className="mt-5 text-[38px] font-semibold leading-tight sm:text-[56px]">
            Built for <span className="text-[#17a77d]">Scale</span> and Impact
          </h2>
          <span className="mx-auto mt-5 block h-[3px] w-12 rounded-full bg-[#17a77d]" />
        </div>
        <div className="mt-14 grid overflow-hidden rounded-[14px] bg-[#0b3b27] md:grid-cols-2 xl:grid-cols-4">
          {impactStats.map(({ value, title, body }) => (
            <article key={title} className="border-b border-[#062416] p-8 md:border-r xl:border-b-0">
              <p className="text-[52px] font-semibold leading-none text-[#17a77d] sm:text-[62px]">{value}</p>
              <h3 className="mt-8 text-[18px] font-semibold">{title}</h3>
              <p className="mt-4 max-w-[260px] text-[15px] leading-7 text-[#82d7c3]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ActionSection() {
  return (
    <section id="platform" className="bg-white px-5 py-24 sm:px-8 lg:px-12">
      <SectionTitle eyebrow="Platform at a glance" title="ReLoop in" accent="Action" />
      <div className="mx-auto mt-16 max-w-[1280px]">
        <AnimatedWorkflowSteps />
        <div className="hidden">
          {[
            { label: 'Pickup', Icon: Truck },
            { label: 'Process', Icon: Gauge },
            { label: 'Payout', Icon: IndianRupee, active: true },
            { label: 'Proof', Icon: ShieldCheck },
          ].map(({ label, Icon, active }, index) => (
            <div key={label} className="flex items-center gap-4">
              {index > 0 && <span className="hidden text-[34px] text-[#9edaca] sm:inline">››</span>}
              <div className="text-center">
                <span className={active ? 'mx-auto flex size-24 items-center justify-center rounded-full bg-[#117d63] text-white shadow-[0_18px_45px_rgba(8,120,95,0.34)]' : 'mx-auto flex size-20 items-center justify-center rounded-full border-2 border-[#17a77d] text-[#08785f] sm:size-24'}>
                  <Icon className="size-9" />
                </span>
                <p className={active ? 'mt-3 text-[17px] font-semibold text-[#08785f]' : 'mt-3 text-[17px] font-semibold text-[#475569]'}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          <OperationsCard />
          <BreakdownCard />
          <ShipmentCard />
        </div>
      </div>
    </section>
  );
}

function OperationsCard() {
  return (
    <article className="flex min-h-[270px] flex-col rounded-[14px] border border-[#dfe8e4] bg-[#f8fbfa] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-semibold">Live Operations</h3>
        <span className="inline-flex items-center gap-2 text-[13px] text-[#17a77d]"><span className="size-2 rounded-full bg-[#17a77d]" />Live</span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {operationStats.map(({ label, value, unit }) => (
          <div key={label} className="rounded-[10px] border border-[#dfe8e4] bg-white p-4">
            <p className="text-[11px] font-semibold uppercase text-[#64748b]">{label}</p>
            <p className="mt-2 text-[24px] font-semibold text-[#08785f]">{value} <span className="text-[12px] font-medium">{unit}</span></p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between text-[13px] text-[#64748b]">
        <span>Material Store Efficiency</span>
        <span className="text-[18px] font-semibold text-[#08785f]">96%</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#dfe8e4]"><span className="block h-full w-[96%] rounded-full bg-[#17a77d]" /></div>
    </article>
  );
}

function BreakdownCard() {
  return (
    <article className="flex min-h-[270px] flex-col rounded-[14px] border border-[#dfe8e4] bg-[#f8fbfa] p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between">
        <h3 className="text-[17px] font-semibold">Material Breakdown</h3>
        <span className="rounded-[6px] bg-[#def5ed] px-3 py-1 text-[12px] text-[#08785f]">This Week</span>
      </div>
      <div className="mt-8 grid gap-7 sm:grid-cols-[150px_1fr] sm:items-center">
        <div className="mx-auto flex size-28 items-center justify-center rounded-full border-[18px] border-[#17a77d] bg-white text-center shadow-[inset_16px_0_0_#9edaca] sm:mx-0">
          <span className="text-[13px] text-[#64748b]">Total<br /><strong className="text-[20px] text-[#171d21]">24,560</strong><br />MT</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {materialBreakdown.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3 text-[14px]">
              <span className="inline-flex items-center gap-2 text-[#475569]"><span className="size-2 rounded-full bg-[#17a77d]" />{label}</span>
              <strong className="text-[#08785f]">{value}</strong>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}

function ShipmentCard() {
  return (
    <article className="flex min-h-[270px] flex-col rounded-[14px] border border-[#dfe8e4] bg-[#f8fbfa] p-5">
      <h3 className="text-[17px] font-semibold">Live Shipment</h3>
      <p className="mt-1 text-[13px] text-[#17a77d]">SHP-2024-1248</p>
      <div className="mt-6 space-y-4">
        {['Picked Up', 'In Transit', 'Received', 'Processing'].map((step, index) => (
          <div key={step} className="flex gap-3">
            <span className={index < 3 ? 'flex size-7 shrink-0 items-center justify-center rounded-full bg-[#17a77d] text-white' : 'flex size-7 shrink-0 items-center justify-center rounded-full bg-[#08785f] text-white shadow-[0_0_0_6px_rgba(8,120,95,0.12)]'}>
              <CheckSquare className="size-4" />
            </span>
            <div>
              <p className="text-[14px] font-semibold text-[#1f2937]">{step}</p>
              <p className="text-[12px] text-[#17a77d]">{index === 0 ? '09:30 AM · 2.4 MT' : index === 1 ? '10:15 AM · En route' : index === 2 ? '12:00 PM · Facility A' : 'In progress...'}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between text-[13px] text-[#64748b]">
        <span>Shipment Progress</span>
        <strong className="text-[17px] text-[#08785f]">70%</strong>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-[#dfe8e4]"><span className="block h-full w-[70%] rounded-full bg-[#17a77d]" /></div>
      <Link href="#operations" className="mt-6 inline-flex text-[14px] font-semibold text-[#08785f]">Track Full Shipment →</Link>
    </article>
  );
}

function ProcessSection() {
  return (
    <section id="operations" className="bg-[#f7fbfa] px-5 py-24 sm:px-8 lg:px-12">
      <SectionTitle eyebrow="Core workflow" title="8-Step ReLoop" accent="Process" />
      <ReLoopProcessAccordion />
      <div className="hidden">
        {[].map(({ title, body, Icon }, index) => {
          const open = index === 0;
          return (
            <article key={title} className={open ? 'border-l-4 border-[#08785f] bg-white' : index === 1 ? 'bg-[#eef8f4]' : 'bg-white'}>
              <div className="flex min-h-[76px] items-center gap-4 border-b border-[#e5ece8] px-5 sm:px-8">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#def5ed] text-[14px] font-semibold text-[#08785f]">{index + 1}</span>
                <Icon className="size-5 shrink-0 text-[#08785f]" />
                <h3 className="flex-1 text-[17px] font-semibold">{title}</h3>
                <span className="text-[22px] text-[#08785f]">{open ? '↓' : '→'}</span>
              </div>
              {open && (
                <div className="grid gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_260px] lg:items-center">
                  <div>
                    <h4 className="text-[26px] font-semibold">{title}</h4>
                    <p className="mt-5 max-w-[760px] text-[17px] leading-8 text-[#475569]">{body}</p>
                    <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#def5ed] px-4 py-2 text-[13px] font-semibold text-[#08785f]"><span className="size-2 rounded-full bg-[#08785f]" />Step 1 of 8</span>
                  </div>
                  <span className="mx-auto flex size-36 items-center justify-center rounded-full bg-[#def5ed] text-[#08785f] sm:size-40">
                    <Icon className="size-16" />
                  </span>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function MaterialsSection() {
  return (
    <section id="compliance" className="bg-[#062416] px-5 py-24 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1510px]">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[38px] font-semibold leading-tight sm:text-[48px]">Materials We Handle</h2>
          <Link href="/sign_in" className="inline-flex min-h-[54px] items-center justify-center rounded-[10px] bg-white px-7 text-[16px] font-semibold text-[#08785f]">
            View All Materials →
          </Link>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {materials.map(({ title, category, Icon, image }) => (
            <article key={title} className="relative min-h-[250px] overflow-hidden rounded-[12px] bg-[#0b3b27]">
              <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${image})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-[#062416] via-[#062416]/40 to-transparent" />
              <span className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur">
                <Icon className="size-5" />
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h3 className="text-[18px] font-semibold">{title}</h3>
                <p className="mt-1 text-[14px] text-white/76">{category}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="bg-[#117d63] px-5 py-24 text-center text-white sm:px-8 lg:px-12">
      <h2 className="mx-auto max-w-[980px] text-[42px] font-semibold leading-tight sm:text-[68px]">Ready to Join India&apos;s Circular Economy?</h2>
      <p className="mx-auto mt-8 max-w-[760px] text-[18px] leading-8 text-white/78">
        Partner with Loopozone to transform your scrap management into a sustainable, traceable, and profitable operation.
      </p>
      <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
        <Link href="/sign_in" className="inline-flex min-h-[62px] items-center justify-center rounded-[10px] bg-white px-8 text-[17px] font-semibold text-[#08785f]">
          Schedule a Material Assessment
        </Link>
        <Link href="#platform" className="inline-flex min-h-[62px] items-center justify-center rounded-[10px] border border-white/35 px-8 text-[17px] font-semibold text-white">
          Explore ReLoop →
        </Link>
      </div>
    </section>
  );
}
