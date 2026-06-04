'use client';

import Link from 'next/link';
import {
  BarChart3,
  Bell,
  Box,
  Cpu,
  Droplet,
  Filter,
  MapPin,
  Package,
  Search,
  Upload,
  Wrench,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { getLivePrices, getMaterialCategories, getUserProfile } from '@/services/user.service';

const SESSION_USER_KEY = 'loopozone_auth_user';
const SIGNUP_DRAFT_KEY = 'loopozone_signup_draft';

const priceCards = [
  { label: 'Cardboard', value: '35', trend: '+75%', trendTone: 'green' },
  { label: 'Copper Wire', value: '450', trend: '+3%', trendTone: 'green' },
  { label: 'Iron Scrap', value: '32', trend: '-1.5%', trendTone: 'red' },
  { label: 'Pet Bottles', value: '24', trend: '+2%', trendTone: 'green' },
];

const categories = [
  { title: 'E-Waste', subtitle: 'Electronics, Batteries', icon: 'zap', tone: 'green' },
  { title: 'Metal', subtitle: 'Iron, Copper, Brass', icon: 'wrench', tone: 'purple' },
  { title: 'Paper', subtitle: 'Cardboard, Mix Paper', icon: 'package', tone: 'orange' },
  { title: 'Plastic', subtitle: 'PET, HDPE, PVC', icon: 'droplet', tone: 'blue' },
];

const categoryIconMap = {
  box: Box,
  cardboard: Box,
  droplet: Droplet,
  ewaste: Zap,
  'e-waste': Zap,
  package: Package,
  paper: Package,
  plastic: Droplet,
  tool: Wrench,
  wrench: Wrench,
  zap: Zap,
};

const categoryToneOrder = ['green', 'purple', 'orange', 'blue'];

const toneClasses = {
  green: 'bg-[#e8f7ef] text-[#2d8f67]',
  purple: 'bg-[#f1e8ff] text-[#9a5cff]',
  orange: 'bg-[#fff0e2] text-[#ff7a1a]',
  blue: 'bg-[#eaf3ff] text-[#4c8df7]',
};

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [dashboardPrices, setDashboardPrices] = useState(priceCards);
  const [dashboardCategories, setDashboardCategories] = useState(categories);

  useEffect(() => {
    let active = true;
    const localProfile = normalizeUserProfile(getLocalProfile());

    if (localProfile) {
      setProfile(localProfile);
    }

    async function loadProfile() {
      try {
        const response = await getUserProfile();
        if (active) {
          setProfile({ ...(localProfile || {}), ...normalizeUserProfile(response) });
        }
      } catch {
        // Local profile fallback is enough for the dashboard header.
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadDashboardCms() {
      const [pricesResult, categoriesResult] = await Promise.allSettled([
        getLivePrices('Mumbai'),
        getMaterialCategories(),
      ]);

      if (!active) {
        return;
      }

      if (pricesResult.status === 'fulfilled') {
        const mappedPrices = normalizePriceCards(pricesResult.value);

        if (mappedPrices.length) {
          setDashboardPrices(mappedPrices);
        }
      }

      if (categoriesResult.status === 'fulfilled') {
        const mappedCategories = normalizeCategories(categoriesResult.value);

        if (mappedCategories.length) {
          setDashboardCategories(mappedCategories);
        }
      }
    }

    loadDashboardCms();

    return () => {
      active = false;
    };
  }, []);

  const displayName = getDisplayName(profile);
  const phoneNumber = getPhoneNumber(profile);
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  return (
    <>
      <MarketingHeader
        active=""
        brandHref="/dashboard"
        actions={<DashboardHeaderActions displayName={displayName} phoneNumber={phoneNumber} initials={initials} />}
      />
      <main className="min-h-screen bg-[#f3f7f5] pt-[86px] font-sans text-[#17233a]">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-7 sm:px-6 lg:px-8">
        <section className="rounded-[22px] border border-[#e1e8e4] bg-white p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex size-14 items-center justify-center rounded-full bg-[#dcefe7] text-[18px] font-semibold text-[#2d8f67]">
                {initials}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[#a0a9b8]">Welcome back,</p>
                <h1 className="text-[24px] font-semibold leading-tight text-[#17233a]">{displayName}</h1>
              </div>
            </div>

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row md:w-[430px]">
              <label className="relative min-w-0 flex-1">
                <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#a0a9b8]" />
                <input
                  className="h-12 w-full rounded-[15px] border border-[#e1e8e4] bg-[#f8faf9] px-12 text-[14px] font-semibold text-[#596579] outline-none transition placeholder:text-[#a0a9b8] focus:border-[#2d8f67]"
                  placeholder="Search materials, sellers..."
                />
              </label>
              <button
                type="button"
                aria-label="Filter"
                className="flex size-12 shrink-0 items-center justify-center rounded-[15px] border border-[#e1e8e4] bg-white text-[#596579] shadow-[0_8px_22px_rgba(15,23,42,0.05)]"
              >
                <Filter className="size-5" />
              </button>
            </div>
          </div>
        </section>

        <section className="mt-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-[20px] font-semibold text-[#17233a]">
              <BarChart3 className="size-5 text-[#2d8f67]" />
              Live indicative Prices
            </h2>
            <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#e1e8e4] bg-white px-4 text-[13px] font-semibold text-[#596579] shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
              <MapPin className="size-4 text-[#2d8f67]" />
              Mumbai
            </span>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardPrices.map((card) => (
              <PriceCard key={card.label} {...card} />
            ))}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[22px] bg-[#4f8b68] p-6 text-white shadow-[0_16px_40px_rgba(47,105,73,0.16)] sm:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_180px] md:items-center">
            <div>
              <h2 className="text-[24px] font-semibold">AI Material ID</h2>
              <p className="mt-4 max-w-[640px] text-[15px] font-semibold leading-7 text-white/92">
                Upload a photo to instantly identify recyclable materials, analyze purity, and generate real-time market valuation estimates.
              </p>
              <button
                type="button"
                className="mt-5 inline-flex min-h-[44px] items-center gap-3 rounded-[10px] bg-white px-6 text-[14px] font-semibold text-[#2f7b58] transition hover:-translate-y-px"
              >
                <Upload className="size-4" />
                Upload Photo
              </button>
            </div>
            <span className="mx-auto hidden size-24 items-center justify-center rounded-full bg-white/14 text-white md:flex">
              <Cpu className="size-12" />
            </span>
          </div>
        </section>

        <section className="mt-9">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[20px] font-semibold">Categories</h2>
            <button type="button" className="rounded-[10px] bg-[#e8f7ef] px-5 py-2 text-[14px] font-semibold text-[#2d8f67]">
              View All
            </button>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardCategories.map(({ title, subtitle, icon, tone }) => {
              const Icon = getCategoryIcon(icon);

              return (
                <article key={title} className="rounded-[16px] border border-[#e1e8e4] bg-white p-7 text-center shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
                  <span className={['mx-auto flex size-16 items-center justify-center rounded-full', toneClasses[tone]].join(' ')}>
                    <Icon className="size-7" />
                  </span>
                  <h3 className="mt-5 text-[18px] font-semibold">{title}</h3>
                  <p className="mt-2 text-[13px] font-semibold text-[#a0a9b8]">{subtitle}</p>
                </article>
              );
            })}
          </div>
        </section>
        </div>
      </main>
    </>
  );
}

function DashboardHeaderActions({ displayName, phoneNumber, initials }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <button
        type="button"
        aria-label="Notifications"
        className="relative flex size-11 items-center justify-center rounded-full border border-[#d8e3f0] bg-white text-[#10233f] shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:size-12"
      >
        <Bell className="size-5" />
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#ef4444] text-[11px] font-semibold text-white">
          3
        </span>
      </button>
      <div className="hidden h-10 w-px bg-[#d8e3f0] sm:block" />
      <Link href="/profile" aria-label="Open profile" className="flex items-center gap-3 text-left">
        <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#10233f] to-[#2f9364] text-[14px] font-semibold text-white sm:size-12">
          {initials}
        </span>
        <div className="hidden sm:block">
          <div className="text-[15px] font-semibold text-[#10233f]">{displayName}</div>
          {phoneNumber && <div className="mt-1 text-[12px] font-semibold text-[#94a3b8]">{phoneNumber}</div>}
        </div>
      </Link>
    </div>
  );
}

function PriceCard({ label, value, trend, trendTone }) {
  return (
    <article className="rounded-[16px] border border-[#e1e8e4] bg-white p-6 shadow-[0_10px_26px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[17px] font-semibold">{label}</h3>
        <span
          className={[
            'rounded-full px-3 py-1 text-[12px] font-semibold',
            trendTone === 'red' ? 'bg-[#fff1f2] text-[#e11d48]' : 'bg-[#dff8ed] text-[#059669]',
          ].join(' ')}
        >
          {trend}
        </span>
      </div>
      <div className="mt-9 flex items-end gap-1">
        <span className="text-[28px] font-semibold leading-none">₹{value}</span>
        <span className="text-[14px] font-semibold text-[#a0a9b8]">/ kg</span>
      </div>
      <p className="mt-3 text-[12px] font-semibold text-[#a0a9b8]">Updated 2h ago</p>
    </article>
  );
}

function normalizePriceCards(response) {
  const prices = Array.isArray(response?.prices)
    ? response.prices
    : Array.isArray(response?.data?.prices)
      ? response.data.prices
      : Array.isArray(response?.data)
        ? response.data
        : [];

  return prices
    .filter((price) => price && typeof price === 'object')
    .map((price) => {
      const change = Number(price.priceChange || 0);

      return {
        label: String(price.materialName || price.name || price.material || 'Material').trim(),
        value: formatPriceValue(price.pricePerKg ?? price.price ?? price.value),
        trend: formatTrend(change),
        trendTone: change < 0 ? 'red' : 'green',
      };
    })
    .filter((price) => price.label && price.value);
}

function normalizeCategories(response) {
  const items = Array.isArray(response?.categories)
    ? response.categories
    : Array.isArray(response?.data?.categories)
      ? response.data.categories
      : Array.isArray(response?.data)
        ? response.data
        : [];

  return items
    .filter((category) => category && typeof category === 'object')
    .map((category, index) => ({
      title: String(category.name || category.title || 'Category').trim(),
      subtitle: String(category.description || category.subtitle || '').trim(),
      icon: String(category.icon || category.name || '').trim().toLowerCase(),
      tone: categoryToneOrder[index % categoryToneOrder.length],
    }))
    .filter((category) => category.title);
}

function formatPriceValue(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return String(value || '').trim();
  }

  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: numberValue % 1 ? 2 : 0,
  }).format(numberValue);
}

function formatTrend(value) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue === 0) {
    return '0%';
  }

  return `${numberValue > 0 ? '+' : ''}${numberValue}%`;
}

function getCategoryIcon(icon) {
  const normalizedIcon = String(icon || '').trim().toLowerCase();
  return categoryIconMap[normalizedIcon] || Box;
}

function getInitials(name) {
  return String(name || 'User')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
}

function getLocalProfile() {
  if (typeof window === 'undefined') {
    return null;
  }

  return readStoredObject(SESSION_USER_KEY) || readStoredObject(SIGNUP_DRAFT_KEY);
}

function normalizeUserProfile(response) {
  const user = response?.user || response?.data?.user || response?.data?.profile || response?.profile || response?.data || response;

  if (!user || typeof user !== 'object') {
    return {};
  }

  return user;
}

function getDisplayName(user) {
  const name = user?.name || user?.fullName || user?.displayName || user?.firstName || user?.userName;

  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName}`.trim();
  }

  return String(name || 'User').trim() || 'User';
}

function getPhoneNumber(user) {
  return user?.phone || user?.mobile || user?.mobileNumber || user?.phoneNumber || user?.contactNumber || '';
}

function readStoredObject(key) {
  try {
    const value = sessionStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}
