'use client';

import Link from 'next/link';
import { Leaf, Menu, X } from 'lucide-react';
import { useState } from 'react';

const defaultNavLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'ReLoop Platform', href: '/reloop-platform' },
  { label: 'Compliance', href: '/compliance' },
  { label: 'AI Operations', href: '/ai-operations' },
];

export function MarketingHeader({ active = 'Home', actions = null, brandHref = '/', navLinks = defaultNavLinks }) {
  const [open, setOpen] = useState(false);
  const hasCustomActions = Boolean(actions);
  const showNav = navLinks.length > 0;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e5e7eb] bg-white">
      <div className="mx-auto flex h-[86px] w-full max-w-[1510px] items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href={brandHref} className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex size-11 items-center justify-center rounded-full border-[3px] border-[#08785f] text-[#08785f]">
            <Leaf className="size-7" />
          </span>
          <span>
            <span className="block text-[20px] font-semibold leading-tight text-[#1d2328]">Loopozone</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[#64748b]">Private Limited</span>
          </span>
        </Link>

        {showNav && (
          <nav className="hidden items-center gap-2 lg:flex">
            {navLinks.map(({ label, href }) => (
              <NavLink key={label} label={label} href={href} active={active === label} />
            ))}
          </nav>
        )}

        {hasCustomActions ? (
          <div className="flex items-center gap-3">{actions}</div>
        ) : (
          <div className="hidden items-center gap-3 sm:flex">
            <Link href="/login" className="rounded-[10px] px-4 py-3 text-[16px] font-medium text-[#4b5563] transition hover:bg-[#f4f7f6] hover:text-[#08785f]">
              Login
            </Link>
            <Link href="/sign_in" className="inline-flex min-h-[50px] items-center justify-center rounded-[10px] bg-[#08785f] px-7 text-[16px] font-semibold text-white transition hover:bg-[#065f4c]">
              Partner With Us -&gt;
            </Link>
          </div>
        )}

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className={[
            'size-11 items-center justify-center rounded-[10px] border border-[#dfe8e4] text-[#08785f] sm:hidden',
            hasCustomActions ? 'hidden' : 'flex',
          ].join(' ')}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[#e5e7eb] bg-white px-5 py-4 shadow-[0_18px_36px_rgba(15,23,42,0.08)] sm:hidden">
          <nav className="grid gap-2">
            {navLinks.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className={[
                  'rounded-[10px] px-4 py-3 text-[15px] font-semibold',
                  active === label ? 'bg-[#eef8f4] text-[#08785f]' : 'text-[#4b5563]',
                ].join(' ')}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link href="/login" className="rounded-[10px] px-4 py-3 text-[15px] font-semibold text-[#4b5563]" onClick={() => setOpen(false)}>
              Login
            </Link>
            <Link href="/sign_in" className="mt-1 rounded-[10px] bg-[#08785f] px-4 py-3 text-center text-[15px] font-semibold text-white" onClick={() => setOpen(false)}>
              Partner With Us -&gt;
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ label, href, active }) {
  return (
    <Link
      href={href}
      className={[
        'rounded-[10px] px-5 py-3 text-[16px] font-medium transition',
        active ? 'bg-[#eef8f4] text-[#08785f]' : 'text-[#4b5563] hover:bg-[#f4f7f6] hover:text-[#08785f]',
      ].join(' ')}
    >
      {label}
    </Link>
  );
}
