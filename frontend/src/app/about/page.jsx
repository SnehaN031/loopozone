import Link from 'next/link';
import {
  Building2,
  Check,
  Cpu,
  Flag,
  Megaphone,
  Settings,
  Users,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';

export const metadata = {
  title: 'About Loopozone | Trusted Circular Economy Network',
  description: 'Learn about Loopozone Private Limited, the company behind ReLoop and its technology-led circular economy network.',
};

const incorporationRows = [
  ['Legal Name', 'Loopozone Private Limited'],
  ['Product / App', 'ReLoop', 'Platform'],
  ['Incorporated', '12 May 2026'],
  ['CIN', 'U38300TZ2026PTC039135'],
  ['PAN', 'AAGCL8864N*'],
  ['TAN', 'CHEL10247G*'],
  ['Authority', 'Ministry of Corporate Affairs, Government of India'],
  ['Type', 'Private Limited Company, limited by Shares'],
];

const positionCards = [
  {
    title: 'Technology-led Execution',
    body: 'Digital workflows, real-time visibility, and AI-driven decisioning power every transaction.',
    Icon: Cpu,
  },
  {
    title: 'Verified Partner Ecosystem',
    body: 'Onboarded and verified scrap generators, aggregators, processors, and buyers ensure trust at every step.',
    Icon: Users,
    featured: true,
  },
  {
    title: 'Processing-led Value Creation',
    body: 'Local processing and responsible recycling unlock higher value, efficiency, and environmental impact.',
    Icon: Settings,
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#171d21]">
      <MarketingHeader active="About" />
      <AboutHero />
      <CompanySection />
      <VisionMissionSection />
      <PositioningSection />
      <AboutCta />
      <MarketingFooter />

    </main>
  );
}

function AboutHero() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-[86px] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2200&q=85)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07170f]/92 via-[#07170f]/62 to-[#07170f]/20" />
      <div className="relative mx-auto flex min-h-[calc(100vh-86px)] w-full max-w-[1510px] items-center px-5 py-16 sm:px-8 lg:px-12">
        <div className="max-w-[760px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8ee5cc] sm:text-[14px]">About Loopozone</p>
          <h1 className="mt-7 text-[60px] font-semibold leading-[0.96] tracking-[-1px] sm:text-[92px] lg:text-[112px]">
            Trusted.
            <br />
            Technology-
            <br />
            Led.
          </h1>
          <p className="mt-8 max-w-[620px] text-[18px] leading-8 text-white/76 sm:text-[21px]">
            India&apos;s most trusted circular economy network, powered by ReLoop.
          </p>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <Link href="#story" className="inline-flex min-h-[58px] items-center justify-center rounded-[10px] bg-[#08785f] px-8 text-[17px] font-semibold text-white transition hover:bg-[#065f4c]">
              Our Story →
            </Link>
            <Link href="#incorporation" className="inline-flex min-h-[58px] items-center justify-center rounded-[10px] border border-white/40 px-8 text-[17px] font-semibold text-white transition hover:bg-white/10">
              View Incorporation Details
            </Link>
          </div>
        </div>
      </div>
      <span className="absolute bottom-10 right-8 hidden origin-center rotate-90 text-[12px] uppercase tracking-[0.25em] text-white/55 lg:block">Scroll</span>
    </section>
  );
}

function CompanySection() {
  return (
    <section id="story" className="bg-white px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1510px] gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0f9b78]">About the company</p>
          <h2 className="mt-5 border-l-4 border-[#17a77d] pl-6 text-[30px] font-semibold leading-[1.35] tracking-[-0.3px] sm:text-[34px]">
            Building India&apos;s most trusted network for recyclable material aggregation, processing, and responsible recycling.
          </h2>
          <div className="mt-9 max-w-[640px] space-y-6 text-[18px] leading-8 text-[#475569]">
            <p>
              Loopozone Private Limited is a new-age circular economy company building India&apos;s most trusted network for recyclable material aggregation, processing, and responsible recycling.
            </p>
            <p>
              Through our platform ReLoop, we bring technology, traceability, partner enablement, and compliance together to create a transparent and efficient ecosystem for scrap management and circular economy operations across India.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <InfoPill title="12 May" subtitle="2026 · Incorporated" />
            <InfoPill title="₹ Pvt. Ltd." subtitle="Company Type" />
            <InfoPill title="MCA" subtitle="Authority" />
          </div>
        </div>

        <article id="incorporation" className="overflow-hidden rounded-[14px] bg-[#062416] text-white">
          <div className="flex items-center justify-between px-7 py-6">
            <h3 className="text-[18px] font-semibold">Incorporation Details</h3>
            <span className="rounded-[6px] border border-[#117d63] bg-[#0b3b27] px-3 py-1 text-[12px] font-semibold text-[#8ee5cc]">REGISTERED</span>
          </div>
          <div>
            {incorporationRows.map(([label, value, badge]) => (
              <div key={label} className="grid gap-3 border-t border-white/8 px-7 py-5 sm:grid-cols-[180px_1fr] sm:items-center">
                <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-white/42">{label}</span>
                <span className="text-[15px] font-semibold text-white sm:text-right">
                  {value}
                  {badge && <span className="ml-3 rounded-[5px] bg-[#117d63] px-2 py-1 text-[11px] text-[#8ee5cc]">{badge}</span>}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t border-white/8 px-7 py-5 text-[14px] text-white/55 sm:flex-row sm:items-center sm:justify-between">
            <span>✓ Registered under the Ministry of Corporate Affairs, Government of India</span>
            <span className="font-semibold text-[#8ee5cc]">MCA · GOI</span>
          </div>
        </article>
      </div>
    </section>
  );
}

function InfoPill({ title, subtitle }) {
  return (
    <div className="rounded-[10px] border border-[#a9e4d4] bg-[#f4fbf8] px-5 py-4">
      <p className="text-[18px] font-semibold text-[#08785f]">{title}</p>
      <p className="mt-1 text-[13px] text-[#64748b]">{subtitle}</p>
    </div>
  );
}

function VisionMissionSection() {
  return (
    <section className="bg-[#062416] px-5 py-24 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1510px]">
        <SectionTitle eyebrow="Our purpose" title="Vision &" accent="Mission" dark />
        <div className="mt-14 grid gap-7 lg:grid-cols-2">
          <PurposeCard number="01" title="Vision" Icon={Megaphone}>
            To build India&apos;s most trusted technology-led circular economy network for recyclable material aggregation, processing, and compliant movement.
          </PurposeCard>
          <PurposeCard number="02" title="Mission" Icon={Flag}>
            To formalise India&apos;s scrap and recycling ecosystem through digital workflows, local processing, verified partners, AI-driven decisioning, and compliance-oriented documentation.
          </PurposeCard>
        </div>
      </div>
    </section>
  );
}

function PurposeCard({ number, title, Icon, children }) {
  return (
    <article className="relative overflow-hidden rounded-[14px] border border-[#117d63]/60 bg-white/[0.04] p-8 sm:p-10">
      <span className="absolute right-8 top-8 text-[76px] font-semibold leading-none text-white/[0.03]">{number}</span>
      <span className="flex size-14 items-center justify-center rounded-[12px] border border-[#117d63]/60 bg-[#0b3b27] text-[#17a77d]">
        <Icon className="size-7" />
      </span>
      <p className="mt-8 text-[13px] font-semibold uppercase tracking-[0.18em] text-[#17a77d]">{title}</p>
      <p className="mt-6 max-w-[700px] text-[23px] font-semibold leading-[1.45] text-white">{children}</p>
      <div className="mt-10 border-t border-white/8 pt-6 text-[15px] text-white/32">{title === 'Vision' ? 'Where we&apos;re going →' : 'How we get there →'}</div>
    </article>
  );
}

function PositioningSection() {
  return (
    <section className="bg-white px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1510px]">
        <SectionTitle eyebrow="Our positioning" title="How We&apos;re" accent="Different" />
        <div className="mt-14 grid gap-7 lg:grid-cols-3">
          {positionCards.map(({ title, body, Icon, featured }) => (
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
              <h3 className="mt-7 text-[22px] font-semibold">{title}</h3>
              <p className="mt-4 text-[16px] leading-7 text-[#64748b]">{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutCta() {
  return (
    <section className="bg-[#062416] px-5 py-24 text-center text-white sm:px-8 lg:px-12">
      <h2 className="mx-auto max-w-[1080px] text-[40px] font-semibold leading-tight sm:text-[58px]">Ready to Transform Your Scrap Operations?</h2>
      <p className="mx-auto mt-7 max-w-[760px] text-[20px] leading-8 text-white/76">Join India&apos;s most trusted circular economy network powered by ReLoop.</p>
      <Link href="/sign_in" className="mt-10 inline-flex min-h-[58px] items-center justify-center rounded-[10px] border border-white/25 px-9 text-[17px] font-semibold text-white transition hover:bg-white/10">
        Partner With Us →
      </Link>
    </section>
  );
}

function SectionTitle({ eyebrow, title, accent, dark = false }) {
  return (
    <div className="text-center">
      <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#17a77d]">{eyebrow}</p>
      <h2 className={dark ? 'mt-4 text-[38px] font-semibold leading-tight tracking-[-0.8px] text-white sm:text-[56px]' : 'mt-4 text-[38px] font-semibold leading-tight tracking-[-0.8px] text-[#171d21] sm:text-[56px]'}>
        {title} <span className="text-[#17a77d]">{accent}</span>
      </h2>
      <span className="mx-auto mt-5 block h-[3px] w-12 rounded-full bg-[#17a77d]" />
    </div>
  );
}
