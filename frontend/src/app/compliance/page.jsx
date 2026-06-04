import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle,
  ClipboardCheck,
  FileText,
  MapPin,
  Package,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';

export const metadata = {
  title: 'Compliance | Loopozone',
  description: 'See how ReLoop supports compliance-aligned circular economy operations with traceability, audit trails, and governance workflows.',
};

const frameworkCards = [
  ['E-Waste Management Rules, 2022', 'Supports traceable e-waste movement through registered and authorised ecosystem participants.'],
  ['Battery Waste Management Rules, 2022', 'Encourages routing through authorised recyclers/refurbishers and EPR-aligned reporting.'],
  ['Plastic / Packaging Waste EPR', 'Supports structured collection, partner mapping, and documentation under applicable EPR frameworks.'],
  ['Pollution Control & Plant-Level Authorisations', 'Processing facilities follow applicable SPCB/PCCo, consent, safety, and operational requirements.'],
];

const governanceCards = [
  ['Partner Verification', 'Onboarding verified and authorised partners', Users],
  ['Material Traceability', 'End-to-end tracking of all materials', MapPin],
  ['Digital Audit Trail', 'Complete digital documentation', ClipboardCheck],
  ['Compliance Mapping', 'Alignment with regulatory frameworks', CheckCircle],
  ['Controlled Payout Process', 'Verified payment workflows', Package],
  ['Exception Monitoring', 'Automated anomaly detection', AlertCircle],
];

export default function CompliancePage() {
  return (
    <main className="min-h-screen bg-white font-sans text-[#171d21]">
      <MarketingHeader active="Compliance" />
      <ComplianceHero />
      <OperationsSection />
      <FrameworkSection />
      <GovernanceSection />
      <ComplianceCta />
      <MarketingFooter />

    </main>
  );
}

function ComplianceHero() {
  return (
    <section className="relative min-h-[470px] overflow-hidden pt-[86px] text-white sm:min-h-[560px]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=2200&q=85)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#061c14]/94 via-[#061c14]/62 to-[#061c14]/24" />
      <div className="relative mx-auto flex min-h-[calc(560px-86px)] w-full max-w-[1510px] items-center px-5 py-16 sm:px-8 lg:px-12">
        <div className="max-w-[860px]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8ee5cc] sm:text-[14px]">Compliance & governance</p>
          <h1 className="mt-7 text-[52px] font-semibold leading-[0.98] tracking-[-1px] sm:text-[82px] lg:text-[104px]">
            Built for
            <br />
            Responsible
            <br />
            Operations.
          </h1>
          <p className="mt-7 max-w-[700px] text-[18px] leading-8 text-white/76">
            Compliance-aware workflows, audit-ready data, and transparent material movement across the circular value chain.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full border border-[#17a77d]/50 bg-[#117d63]/55 px-4 py-2 text-[14px] font-semibold text-[#8ee5cc]">✓ Regulatory Alignment</span>
            <span className="rounded-full border border-[#17a77d]/50 bg-[#117d63]/55 px-4 py-2 text-[14px] font-semibold text-[#8ee5cc]">📋 Audit-Ready</span>
            <span className="rounded-full border border-[#17a77d]/50 bg-[#117d63]/55 px-4 py-2 text-[14px] font-semibold text-[#8ee5cc]">👥 Responsible Ecosystem</span>
          </div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="#frameworks" className="inline-flex min-h-[58px] items-center justify-center rounded-[10px] bg-[#08785f] px-8 text-[17px] font-semibold text-white transition hover:bg-[#065f4c]">
              View Regulatory Frameworks →
            </Link>
            <Link href="#governance" className="inline-flex min-h-[58px] items-center justify-center rounded-[10px] border border-white/40 px-8 text-[17px] font-semibold text-white transition hover:bg-white/10">
              Download Compliance Guide
            </Link>
          </div>
        </div>
      </div>
      <span className="absolute bottom-10 right-8 hidden origin-center rotate-90 text-[12px] uppercase tracking-[0.25em] text-white/55 lg:block">Scroll</span>
    </section>
  );
}

function OperationsSection() {
  return (
    <section className="bg-[#f7fbfa] px-5 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1510px] gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-[38px] font-semibold leading-tight sm:text-[48px]">Compliance-First Operations</h2>
          <div className="mt-8 max-w-[680px] space-y-6 text-[18px] leading-8 text-[#475569]">
            <p>ReLoop is built with compliance, traceability, and responsible execution at its foundation, not as an afterthought.</p>
            <p>We support regulatory frameworks, partner authorisations, audit-ready documentation, and transparent material movement across the circular economy value chain.</p>
          </div>
        </div>
        <div
          className="min-h-[320px] rounded-[14px] bg-cover bg-center shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:min-h-[420px]"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=85)' }}
        />
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

function FrameworkSection() {
  return (
    <section id="frameworks" className="bg-white px-5 py-24 sm:px-8 lg:px-12">
      <SectionTitle eyebrow="Regulatory frameworks" title="Aligned with India&apos;s" accent="Regulatory Landscape" />
      <div className="mx-auto mt-14 grid max-w-[1280px] gap-7 lg:grid-cols-2">
        {frameworkCards.map(([title, body], index) => (
          <article key={title} className="grid gap-5 rounded-[14px] border border-[#dfe8e4] border-t-[#08785f] border-t-4 bg-white p-7 sm:grid-cols-[52px_1fr]">
            <span className="flex size-12 items-center justify-center rounded-full bg-[#def5ed] text-[20px] font-semibold text-[#08785f]">{index + 1}</span>
            <div>
              <h3 className="text-[20px] font-semibold">{title}</h3>
              <p className="mt-3 text-[16px] leading-7 text-[#64748b]">{body}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GovernanceSection() {
  return (
    <section id="governance" className="bg-[#f7fbfa] px-5 py-24 sm:px-8 lg:px-12">
      <SectionTitle eyebrow="Governance framework" title="Six Pillars of" accent="Governance" />
      <div className="mx-auto mt-14 grid max-w-[1280px] gap-7 md:grid-cols-2 xl:grid-cols-3">
        {governanceCards.map(([title, body, Icon]) => (
          <article key={title} className="rounded-[14px] border border-[#dfe8e4] bg-white p-8">
            <span className="flex size-14 items-center justify-center rounded-[10px] bg-[#def5ed] text-[#08785f]">
              <Icon className="size-7" />
            </span>
            <h3 className="mt-7 text-[20px] font-semibold">{title}</h3>
            <p className="mt-4 text-[16px] leading-7 text-[#64748b]">{body}</p>
          </article>
        ))}
      </div>
      <div className="mx-auto mt-14 flex max-w-[1510px] gap-4 bg-[#def5ed] px-6 py-6 text-[16px] leading-7 text-[#1f2937]">
        <ShieldCheck className="mt-1 size-6 shrink-0 text-[#08785f]" />
        <p><strong>Important:</strong> ReLoop supports compliance-aligned operations but does not guarantee statutory compliance. Users must ensure adherence to all applicable laws, regulations, and authorisations.</p>
      </div>
    </section>
  );
}

function ComplianceCta() {
  return (
    <section className="bg-[#062416] px-5 py-24 text-center text-white sm:px-8 lg:px-12">
      <h2 className="mx-auto max-w-[980px] text-[40px] font-semibold leading-tight sm:text-[56px]">&quot;Compliance is not an add-on. It is embedded into the operating model.&quot;</h2>
      <p className="mx-auto mt-12 max-w-[760px] text-[20px] leading-8 text-white/76">Build trust through transparency and compliance-first operations.</p>
      <Link href="/sign_in" className="mt-10 inline-flex min-h-[58px] items-center justify-center rounded-[10px] border border-white/25 px-9 text-[17px] font-semibold text-white transition hover:bg-white/10">
        Partner With Us →
      </Link>
    </section>
  );
}
