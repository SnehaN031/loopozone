import { Leaf, MapPin, Recycle, ShieldCheck, Sparkles, Tags, TrendingUp, UsersRound, Zap } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const promoContent = {
  login: {
    badge: 'Circular economy',
    BadgeIcon: Recycle,
    headline: (
      <>
        Trade waste. Build a <span className="text-[#4ade80]">greener</span> India.
      </>
    ),
    subtext: '18,000+ members buying and selling recycled materials across India.',
    features: [
      { title: 'Instant OTP', description: 'No passwords ever', Icon: Zap },
      { title: 'Verified', description: 'Safe transactions', Icon: ShieldCheck },
      { title: 'Pan-India', description: 'Local recyclers', Icon: MapPin },
    ],
  },
  signIn: {
    badge: 'Free forever',
    BadgeIcon: Sparkles,
    headline: (
      <>
        Join the <span className="text-[#4ade80]">green</span> movement.
      </>
    ),
    subtext: 'List materials, find buyers, and earn while helping the planet.',
    features: [
      { title: 'List for free', description: 'No fees, ever', Icon: Tags },
      { title: 'Earn from waste', description: 'Turn scrap to income', Icon: TrendingUp },
      { title: '18,000+ members', description: 'Pan-India network', Icon: UsersRound },
    ],
  },
};

export function AuthPromoPanel({ mode = 'login' }) {
  const content = promoContent[mode] ?? promoContent.login;
  const BadgeIcon = content.BadgeIcon;

  return (
    <aside className="relative overflow-hidden bg-[#0a3320] px-6 py-7 text-white sm:px-8 md:min-h-full md:px-7 lg:px-8">
      <PromoPattern />
      <div className="relative z-10 flex h-full flex-col">
        <BrandLogo />

        <div className="mt-9 inline-flex w-fit items-center gap-2 rounded-full border border-[#22c55e]/20 bg-[#16a34a]/25 px-3 py-1.5 text-[12px] font-semibold text-[#86efac] md:mt-14">
          <BadgeIcon className="size-3.5" />
          {content.badge}
        </div>

        <div className="mt-7">
          <h2 className="max-w-[220px] text-[25px] font-semibold leading-[1.18] tracking-[-0.5px] text-white md:text-[28px]">
            {content.headline}
          </h2>
          <p className="mt-5 max-w-[240px] text-[14px] leading-7 text-white/55 md:text-[15px]">{content.subtext}</p>
        </div>

        <div className="mt-7 divide-y divide-white/10 md:mt-9">
          {content.features.map(({ title, description, Icon }) => (
            <div key={title} className="flex gap-4 py-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[#4ade80]/10 bg-[#4ade80]/10 text-[#4ade80]">
                <Icon className="size-[18px]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white md:text-[15px]">{title}</p>
                <p className="mt-1.5 text-[13px] text-white/50">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3 pt-4 md:mt-auto md:pt-10">
          <p className="text-[12px] text-white/35">&copy; 2025 LoopOZone</p>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[12px] text-white/55">
            <Leaf className="size-3.5 text-[#4ade80]" />
            Made in India
          </div>
        </div>
      </div>
    </aside>
  );
}

function PromoPattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      fill="none"
      preserveAspectRatio="none"
      viewBox="0 0 320 760"
    >
      <g stroke="rgba(255,255,255,0.05)" strokeWidth="1.3">
        <circle cx="292" cy="70" r="76" />
        <circle cx="292" cy="70" r="132" />
        <circle cx="38" cy="710" r="94" />
        <circle cx="38" cy="710" r="140" />
        <path d="M-72 236 342 664" />
        <path d="M-90 318 330 750" />
      </g>
    </svg>
  );
}
