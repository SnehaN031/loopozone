import Link from 'next/link';
import {
  Brain,
  ClipboardCheck,
  Database,
  DollarSign,
  Eye,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';

export const metadata = {
  title: 'AI Operations | Loopozone',
  description: 'Discover AI-powered material classification, smart pricing, routing, buyer matching, and audit automation in ReLoop.',
};

const aiCards = [
  {
    title: 'AI-Assisted Material Classification',
    body: 'Computer vision models classify materials with high accuracy to improve sorting efficiency and reduce contamination.',
    Icon: Eye,
  },
  {
    title: 'Smart Pricing Intelligence',
    body: 'AI analyses market trends, supply-demand, quality, and location to suggest optimal and dynamic pricing.',
    Icon: DollarSign,
    featured: true,
  },
  {
    title: 'Pickup & Route Optimisation',
    body: 'AI optimises pickup schedules and delivery routes to reduce cost, improve utilisation, and increase on-time performance.',
    Icon: MapPin,
  },
  {
    title: 'Buyer Matching Engine',
    body: 'AI matches material with the most relevant buyers based on demand, rating, location, and historical fulfillment.',
    Icon: Users,
  },
  {
    title: 'Fraud & Variance Detection',
    body: 'AI detects anomalies in weight, quality, pricing, and documentation to prevent fraud and reduce losses.',
    Icon: ShieldCheck,
  },
  {
    title: 'Compliance & Audit Automation',
    body: 'AI extracts, verifies, and reconciles documents automatically to ensure compliance and audit readiness.',
    Icon: ClipboardCheck,
  },
];

const intelligenceStats = [
  ['Daily Material Inflow', '524.8', 'MT', '+12.5%'],
  ['Processing Throughput', '418.6', 'MT', '+9.7%'],
  ['Buyer Pipeline', '₹8.75', 'Cr', '+15.3%'],
  ['Gross Margin', '18.7', '%', '+2.1%'],
  ['Inventory Aging', '18.6', 'Days', '-2.4d'],
  ['Compliance Score', '96', '%', '+6%'],
  ['Partner Performance', '4.6', '/5', '+6.2%'],
  ['Active Exceptions', '12', '', '-30%'],
];

const promiseItems = [
  ['Faster Decisions', 'Real-time insights that accelerate every transaction', Zap],
  ['Cleaner Records', 'Automated data capture reduces errors and omissions', Database],
  ['Better Margins', 'Optimised pricing, routing, and matching improve profitability', TrendingUp],
  ['Stronger Compliance', 'Automated checks ensure regulatory alignment at scale', ShieldCheck],
];

export default function AiOperationsPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#171d21]">
      <MarketingHeader active="AI Operations" />
      <HeroSection />
      <UseCasesSection />
      <DashboardSection />
      <PromiseSection />
      <AiCta />
      <MarketingFooter />

    </main>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-[86px] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=2200&q=85)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#061c14]/94 via-[#061c14]/66 to-[#061c14]/28" />
      <div className="relative mx-auto grid min-h-[calc(100vh-86px)] w-full max-w-[1510px] items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8ee5cc] sm:text-[14px]">AI-powered operations</p>
          <h1 className="mt-7 text-[58px] font-semibold leading-[0.96] tracking-[-1px] sm:text-[92px] lg:text-[108px]">
            AI That
            <br />
            Actually
            <br />
            Works.
          </h1>
          <p className="mt-8 max-w-[680px] text-[18px] leading-8 text-white/76 sm:text-[21px]">
            Faster decisions. Cleaner records. Better margins. Stronger compliance.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link href="#use-cases" className="inline-flex min-h-[58px] items-center justify-center rounded-[10px] bg-[#08785f] px-8 text-[17px] font-semibold text-white transition hover:bg-[#065f4c]">
              Experience AI in Action →
            </Link>
            <Link href="/sign_in" className="inline-flex min-h-[58px] items-center justify-center rounded-[10px] border border-white/40 px-8 text-[17px] font-semibold text-white transition hover:bg-white/10">
              Book a Live Demo
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:justify-self-end">
          <div className="grid gap-4 sm:grid-cols-2">
            <HeroMetric title="Material Classification" value="PET Bottles" note="98.6% Confidence" />
            <HeroMetric title="Smart Pricing" value="₹24.50/kg" note="+8.3% vs yesterday" />
            <HeroMetric title="Route Optimisation" value="ETA 45 min" note="-15 min optimised" />
            <HeroMetric title="Top Buyer Match" value="GreenLoop Pvt. Ltd." note="★ ★ ★ ★ ☆" />
          </div>
          <div className="rounded-[12px] border border-[#1a5b43] bg-[#0b3b27] p-5">
            <p className="text-[14px] text-[#8ee5cc]">Weekly Material Inflow</p>
            <div className="mt-5 flex h-24 items-end gap-2">
              {[44, 58, 66, 54, 70, 74, 78].map((height, index) => (
                <span key={index} className="flex-1 rounded-t bg-[#23a47c]" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <span className="absolute bottom-10 right-8 hidden origin-center rotate-90 text-[12px] uppercase tracking-[0.25em] text-white/55 lg:block">Scroll</span>
    </section>
  );
}

function HeroMetric({ title, value, note }) {
  return (
    <article className="rounded-[12px] border border-[#1a5b43] bg-[#0b3b27] p-5">
      <p className="text-[14px] text-[#8ee5cc]">{title}</p>
      <p className="mt-4 text-[22px] font-semibold text-white">{value}</p>
      <p className="mt-2 text-[15px] text-[#17a77d]">{note}</p>
    </article>
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

function UseCasesSection() {
  return (
    <section id="use-cases" className="bg-white px-5 py-24 sm:px-8 lg:px-12">
      <SectionTitle eyebrow="AI use cases" title="Intelligent Operations" accent="at Scale" />
      <div className="mx-auto mt-14 grid max-w-[1280px] gap-7 md:grid-cols-2 xl:grid-cols-3">
        {aiCards.map(({ title, body, Icon, featured }) => (
          <article
            key={title}
            className={[
              'rounded-[14px] border bg-white p-8 shadow-[0_14px_38px_rgba(15,23,42,0.03)]',
              featured ? 'border-[#8bdac5] shadow-[0_28px_70px_rgba(8,120,95,0.14)]' : 'border-[#dfe8e4]',
            ].join(' ')}
          >
            <span className={featured ? 'flex size-14 items-center justify-center rounded-[10px] bg-[#08785f] text-white' : 'flex size-14 items-center justify-center rounded-[10px] bg-[#e1f6ef] text-[#08785f]'}>
              <Icon className="size-7" />
            </span>
            <h3 className="mt-7 text-[20px] font-semibold">{title}</h3>
            <p className="mt-4 text-[16px] leading-7 text-[#64748b]">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function DashboardSection() {
  return (
    <section className="bg-[#062416] px-5 py-24 text-white sm:px-8 lg:px-12">
      <SectionTitleDark eyebrow="Dashboard preview" title="Operational" accent="Intelligence Dashboard" />
      <div className="mx-auto mt-14 max-w-[1280px]">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {intelligenceStats.map(([label, value, unit, change]) => (
            <article key={label} className="rounded-[12px] border border-[#1a5b43] bg-[#0b3b27] p-6">
              <p className="text-[14px] text-[#8ee5cc]">{label}</p>
              <p className="mt-4 text-[34px] font-semibold text-[#17a77d]">{value}<span className="text-[18px]">{unit}</span></p>
              <p className="mt-2 text-[14px] text-[#17a77d]">{change}</p>
            </article>
          ))}
        </div>
        <article className="mt-7 rounded-[12px] border border-[#1a5b43] bg-[#0b3b27] p-7">
          <h3 className="flex items-center gap-3 text-[22px] font-semibold"><Brain className="size-6 text-[#17a77d]" />AI Insights & Alerts</h3>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {[
              'Alert: PET Bottles inflow spiked 14% this week.',
              'Route R-02 can save ₹2,140 in fuel this week.',
              '3 transactions flagged for variance review now.',
              'Compliance score 96%, improved by 6% this week.',
            ].map((item, index) => (
              <div key={item} className="flex items-center gap-4 rounded-[10px] bg-[#041d12] p-5 text-[#8ee5cc]">
                <span className={index === 2 ? 'size-5 rounded-full bg-gradient-to-br from-[#facc15] to-[#fb7185]' : 'size-5 rounded-full bg-gradient-to-br from-[#bbf7d0] to-[#17a77d]'} />
                {item}
              </div>
            ))}
          </div>
          <Link href="/sign_in" className="mt-6 inline-flex text-[16px] font-semibold text-[#17a77d]">View all insights & alerts →</Link>
        </article>
      </div>
    </section>
  );
}

function SectionTitleDark({ eyebrow, title, accent }) {
  return (
    <div className="text-center">
      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8ee5cc]">{eyebrow}</p>
      <h2 className="mt-4 text-[38px] font-semibold leading-tight tracking-[-0.8px] text-white sm:text-[56px]">
        {title} <span className="text-[#17a77d]">{accent}</span>
      </h2>
      <span className="mx-auto mt-5 block h-[3px] w-12 rounded-full bg-[#17a77d]" />
    </div>
  );
}

function PromiseSection() {
  return (
    <section className="bg-white px-5 py-24 sm:px-8 lg:px-12">
      <SectionTitle eyebrow="" title="The AI" accent="Operating Promise" />
      <div className="mx-auto mt-14 grid max-w-[1280px] gap-8 sm:grid-cols-2 xl:grid-cols-4">
        {promiseItems.map(([title, body, Icon]) => (
          <article key={title} className="text-center">
            <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-[#def5ed] text-[#08785f]">
              <Icon className="size-9" />
            </span>
            <h3 className="mt-7 text-[22px] font-semibold">{title}</h3>
            <p className="mx-auto mt-4 max-w-[280px] text-[16px] leading-7 text-[#64748b]">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function AiCta() {
  return (
    <section className="bg-[#062416] px-5 py-24 text-center text-white sm:px-8 lg:px-12">
      <h2 className="mx-auto max-w-[1060px] text-[40px] font-semibold leading-tight sm:text-[56px]">The Future of Circular Economy Operations</h2>
      <p className="mx-auto mt-7 max-w-[820px] text-[20px] leading-8 text-white/76">
        ReLoop combines people, process, technology, compliance, and AI to power the next generation of circular economy execution.
      </p>
      <Link href="/sign_in" className="mt-10 inline-flex min-h-[58px] items-center justify-center rounded-[10px] border border-white/25 px-9 text-[17px] font-semibold text-white transition hover:bg-white/10">
        Talk to Our AI Experts →
      </Link>
    </section>
  );
}
