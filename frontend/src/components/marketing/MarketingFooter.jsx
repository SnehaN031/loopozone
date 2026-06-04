import Link from 'next/link';
import { AtSign, Globe, Leaf, Mail, Send } from 'lucide-react';

const footerColumns = [
  { title: 'Company', items: ['About Us', 'Our Approach', 'Careers', 'News & Insights'] },
  { title: 'Platform', items: ['ReLoop Platform', 'AI Operations', 'Partner Network'] },
];

const complianceItems = ['Regulatory Alignment', 'Privacy Policy', 'Terms & Conditions', 'Disclaimer'];

export function MarketingFooter() {
  return (
    <footer className="bg-[#062416] px-5 py-16 text-[#8ee5cc] sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-[1510px] gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3 text-white">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#def5ed] text-[#08785f]">
              <Leaf className="size-6" />
            </span>
            <span className="text-[21px] font-semibold">Loopozone</span>
          </div>
          <p className="mt-6">From pickup to payout to proof.</p>
          <div className="mt-6 flex gap-3">
            {[Globe, AtSign, Send, Mail].map((Icon, index) => (
              <span key={index} className="flex size-10 items-center justify-center rounded-full bg-white/8 text-[#8ee5cc]">
                <Icon className="size-5" />
              </span>
            ))}
          </div>
        </div>

        {footerColumns.map(({ title, items }) => (
          <FooterColumn key={title} title={title} items={items} />
        ))}

        <div>
          <FooterColumn title="Compliance" items={complianceItems} />
          <h3 className="mt-8 text-[20px] font-semibold text-white">Contact</h3>
          <p className="mt-4 leading-7">+91 124 456 7890<br />info@loopozone.com<br />Gurugram, Haryana, India</p>
        </div>
      </div>
      <div className="mx-auto mt-14 flex max-w-[1510px] flex-col gap-4 border-t border-white/10 pt-8 text-[15px] md:flex-row md:justify-between">
        <p>© 2026 Loopozone Private Limited. All rights reserved. CIN: U38300TZ2026PTC039135</p>
        <p>ReLoop is a product/platform of Loopozone Private Limited.</p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h3 className="text-[20px] font-semibold text-white">{title}</h3>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <Link key={item} href={getFooterHref(item)} className="block text-[16px] text-[#8ee5cc] hover:text-white">
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}

function getFooterHref(item) {
  const hrefs = {
    'About Us': '/about',
    'Our Approach': '/about',
    'ReLoop Platform': '/reloop-platform',
    'AI Operations': '/ai-operations',
    'Partner Network': '/reloop-platform',
    'Regulatory Alignment': '/compliance',
    'Privacy Policy': '/compliance',
    'Terms & Conditions': '/compliance',
    Disclaimer: '/compliance',
  };

  return hrefs[item] ?? '/';
}
