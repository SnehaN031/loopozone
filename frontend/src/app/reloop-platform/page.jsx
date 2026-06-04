import Link from 'next/link';
import {
  BatteryCharging,
  Box,
  Building2,
  Handshake,
  Layers,
  Package,
  Recycle,
  ShieldCheck,
  Truck,
  UserPlus,
  Zap,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';

export const metadata = {
  title: 'ReLoop Platform | Loopozone',
  description: 'Explore ReLoop, the digital operating layer for scrap aggregation, traceability, processing, payout, and buyer matching.',
};

const dashboardStats = [
  ['Collected', '24,560', 'MT'],
  ['Active Leads', '1,248', ''],
  ['In-Transit', '325', 'MT'],
  ['Completed', '146', ''],
];

const workflowSteps = [
  ['Lead Creation', 'Leads are captured from sellers, partners, or enterprise sources.'],
  ['Inspection & Grading', 'Material is inspected, graded, and verified at source.'],
  ['Quote & Approval', 'Dynamic pricing is shared and approved digitally by the seller.'],
  ['Pickup & Logistics', 'Optimised pickup is scheduled and executed with live tracking.'],
  ['Weighing & Validation', 'Material is weighed, validated, and matched with documents.'],
  ['Payout & Settlement', 'Payout is processed quickly with digital settlement.'],
  ['Inventory & Processing', 'Material is moved to processing centers and inventory updated.'],
  ['Buyer Matching', 'Processed material is matched with verified buyers.'],
];

const materialCategories = [
  ['Ferrous Scrap', Package],
  ['Non-Ferrous Scrap', Layers],
  ['Industrial Scrap', Box],
  ['Electronic Waste', Zap],
  ['Battery Waste', BatteryCharging],
  ['Plastic Waste', Recycle],
  ['Packaging Waste', Package],
  ['Corporate Disposal', ShieldCheck],
];

const businessCards = [
  {
    title: 'B2B',
    body: 'Partner with aggregators, processors, and enterprises for consistent material flow and transparency.',
    Icon: Handshake,
  },
  {
    title: 'Corporate',
    body: 'Enable ESG-aligned waste management, reporting, and compliance for businesses.',
    Icon: Building2,
  },
  {
    title: 'Retail/Distributed',
    body: 'Empower local collectors and small businesses through a digital-first platform.',
    Icon: UserPlus,
  },
];

export default function ReLoopPlatformPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#171d21]">
      <MarketingHeader active="ReLoop Platform" />
      <HeroSection />
      <DashboardSection />
      <WorkflowSection />
      <MaterialsSection />
      <BusinessSection />
      <PlatformCta />
      <MarketingFooter />

    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-[86px] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=2200&q=85)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#061c14]/94 via-[#061c14]/58 to-[#061c14]/20" />
      <div className="relative mx-auto flex min-h-[calc(100vh-86px)] w-full max-w-[1510px] items-center px-5 py-16 sm:px-8 lg:px-12">
        <div className="max-w-[760px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8ee5cc] sm:text-[14px]">ReLoop Platform</p>
          <h1 className="mt-7 text-[58px] font-semibold leading-[0.96] tracking-[-1px] sm:text-[90px] lg:text-[112px]">
            The Digital
            <br />
            Operating
            <br />
            Layer.
          </h1>
          <p className="mt-8 max-w-[650px] text-[18px] leading-8 text-white/76 sm:text-[21px]">
            Scrap aggregation, traceability, processing, and buyer matching, in one platform.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link href="/sign_in" className="inline-flex min-h-[58px] items-center justify-center rounded-[10px] bg-[#08785f] px-8 text-[17px] font-semibold text-white transition hover:bg-[#065f4c]">
              Book a Demo →
            </Link>
            <Link href="#capabilities" className="inline-flex min-h-[58px] items-center justify-center rounded-[10px] border border-white/40 px-8 text-[17px] font-semibold text-white transition hover:bg-white/10">
              Explore Capabilities
            </Link>
          </div>
        </div>
      </div>
      <span className="absolute bottom-10 right-8 hidden origin-center rotate-90 text-[12px] uppercase tracking-[0.25em] text-white/55 lg:block">Scroll</span>
    </section>
  );
}

function DashboardSection() {
  return (
    <section className="bg-[#062416] px-5 py-24 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1280px] rounded-[14px] border border-[#1a5b43] bg-[#0b3b27] p-5 sm:p-10">
        <div className="rounded-[14px] bg-[#041d12] p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[22px] font-semibold">ReLoop Dashboard</h2>
            <span className="inline-flex items-center gap-2 text-[#8ee5cc]"><span className="size-2 rounded-full bg-[#17a77d]" />Live</span>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardStats.map(([label, value, unit]) => (
              <div key={label} className="rounded-[10px] border border-[#1a5b43] bg-[#0b3b27] p-5">
                <p className="text-[14px] text-[#8ee5cc]">{label}</p>
                <p className="mt-4 text-[30px] font-semibold text-[#17a77d]">{value} <span className="text-[14px] font-medium">{unit}</span></p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-[10px] border border-[#1a5b43] bg-[#0b3b27] p-6">
            <h3 className="text-[18px] font-semibold">Activity Timeline</h3>
            <div className="mt-5 grid gap-4 text-[#8ee5cc] sm:grid-cols-2 lg:grid-cols-3">
              {['Lead Created', 'Inspection', 'Pickup', 'Weighing', 'Payout', 'Completed'].map((item) => (
                <span key={item} className="inline-flex items-center gap-3"><span className="size-2 rounded-full bg-[#17a77d]" />{item}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
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

function WorkflowSection() {
  return (
    <section id="capabilities" className="bg-white px-5 py-24 sm:px-8 lg:px-12">
      <SectionTitle eyebrow="Core workflow" title="8-Step ReLoop" accent="Process" />
      <div className="mx-auto mt-16 grid max-w-[1280px] gap-x-7 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
        {workflowSteps.map(([title, body], index) => (
          <article key={title} className="relative rounded-[14px] border border-[#dfe8e4] bg-white px-5 pb-6 pt-12 text-center">
            <span className="absolute left-1/2 top-0 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#08785f] text-[20px] font-semibold text-white">
              {index + 1}
            </span>
            <h3 className="text-[18px] font-semibold">{title}</h3>
            <p className="mt-4 text-[15px] leading-7 text-[#64748b]">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MaterialsSection() {
  return (
    <section className="bg-[#f7fbfa] px-5 py-24 sm:px-8 lg:px-12">
      <SectionTitle eyebrow="Material categories" title="Materials We" accent="Handle" />
      <div className="mx-auto mt-14 grid max-w-[1280px] gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {materialCategories.map(([title, Icon]) => (
          <article key={title} className="rounded-[14px] border border-[#dfe8e4] bg-white p-8 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-[10px] bg-[#def5ed] text-[#08785f]">
              <Icon className="size-7" />
            </span>
            <h3 className="mt-7 text-[18px] font-semibold">{title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function BusinessSection() {
  return (
    <section className="bg-white px-5 py-24 sm:px-8 lg:px-12">
      <SectionTitle eyebrow="Operating model" title="Built for Every" accent="Business" />
      <div className="mx-auto mt-14 grid max-w-[1280px] gap-7 lg:grid-cols-3">
        {businessCards.map(({ title, body, Icon }) => (
          <article key={title} className="rounded-[14px] border border-[#dfe8e4] bg-white p-8">
            <span className="flex size-14 items-center justify-center rounded-[10px] bg-[#def5ed] text-[#08785f]">
              <Icon className="size-7" />
            </span>
            <h3 className="mt-7 text-[22px] font-semibold">{title}</h3>
            <p className="mt-4 text-[16px] leading-7 text-[#64748b]">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function PlatformCta() {
  return (
    <section className="bg-[#062416] px-5 py-24 text-center text-white sm:px-8 lg:px-12">
      <h2 className="mx-auto max-w-[980px] text-[40px] font-semibold leading-tight sm:text-[56px]">From pickup to payout to proof</h2>
      <p className="mx-auto mt-7 max-w-[760px] text-[20px] leading-8 text-white/76">ReLoop helps convert fragmented material movement into structured circular economy execution.</p>
      <Link href="/sign_in" className="mt-10 inline-flex min-h-[58px] items-center justify-center rounded-[10px] border border-white/25 px-9 text-[17px] font-semibold text-white transition hover:bg-white/10">
        Partner With Us →
      </Link>
    </section>
  );
}
