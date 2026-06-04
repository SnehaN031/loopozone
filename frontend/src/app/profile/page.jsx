'use client';

import Link from 'next/link';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Globe,
  HelpCircle,
  Headphones,
  LogOut,
  MapPin,
  Repeat,
  Settings,
  Shield,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { clearAuthSession } from '@/services/client.service';
import { getUserDashboard, getUserProfile } from '@/services/user.service';

const SESSION_USER_KEY = 'loopozone_auth_user';
const SIGNUP_DRAFT_KEY = 'loopozone_signup_draft';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    let active = true;
    const localProfile = normalizeUserProfile(getLocalProfile());

    if (localProfile) {
      setProfile(localProfile);
    }

    async function loadProfile() {
      const [profileResult, dashboardResult] = await Promise.allSettled([
        getUserProfile(),
        getUserDashboard(),
      ]);

      if (!active) {
        return;
      }

      if (profileResult.status === 'fulfilled') {
        setProfile({ ...(localProfile || {}), ...normalizeUserProfile(profileResult.value) });
      }

      if (dashboardResult.status === 'fulfilled') {
        setDashboardData(dashboardResult.value.dashboardData || null);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const displayName = getDisplayName(profile);
  const phoneNumber = getPhoneNumber(profile) || 'Phone not available';
  const initials = useMemo(() => getInitials(displayName), [displayName]);
  const ordersValue = dashboardData?.orders ?? profile?.orders ?? 0;
  const walletValue = dashboardData?.walletBalance
    ? `Rs.${Number(dashboardData.walletBalance).toLocaleString('en-IN')}`
    : profile?.walletBalance
      ? `Rs.${Number(profile.walletBalance).toLocaleString('en-IN')}`
      : 'Rs.0';

  return (
    <>
      <MarketingHeader active="" brandHref="/" actions={<ProfileHeaderActions initials={initials} displayName={displayName} />} />
      <main className="min-h-screen bg-[#f5f8fc] pt-[86px] font-sans text-[#10233f]">
        <div className="mx-auto w-full max-w-[1180px] px-4 py-6 sm:px-6 lg:px-8">
          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-[28px] font-semibold leading-tight text-[#10233f]">Your Profile</h1>
                <p className="mt-1 text-[14px] text-[#64748b]">Manage account details, role, preferences, and support.</p>
              </div>
              <button
                type="button"
                aria-label="Profile settings"
                className="flex size-11 items-center justify-center rounded-full border border-[#d8e3f0] bg-white text-[#31566a] shadow-[0_8px_24px_rgba(15,23,42,0.05)]"
              >
                <Settings className="size-5" />
              </button>
            </div>

            <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
              <ProfileSummary
                profile={profile}
                displayName={displayName}
                phoneNumber={phoneNumber}
                initials={initials}
                ordersValue={ordersValue}
                walletValue={walletValue}
              />
              <SwitchRoleCard sellerType={profile?.sellerType} />
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <ProfileSection title="Account Settings">
                <ProfileMenuItem Icon={MapPin} label="Saved Addresses" />
                <ProfileMenuItem Icon={Globe} label="Language" value="English" />
                <ProfileMenuItem Icon={Shield} label="Security & Password" />
              </ProfileSection>

              <ProfileSection title="Support">
                <ProfileMenuItem Icon={HelpCircle} label="Help Center & FAQs" />
                <ProfileMenuItem Icon={Headphones} label="Contact Support" />
                <button
                  type="button"
                  className="flex min-h-[70px] w-full items-center gap-5 text-left text-[#dc2626]"
                  onClick={handleLogout}
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#fff1f2]">
                    <LogOut className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1 text-[17px] font-semibold">Log Out</span>
                  <ChevronRight className="size-5 shrink-0 text-[#fca5a5]" />
                </button>
              </ProfileSection>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function ProfileHeaderActions({ initials, displayName }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <button
        type="button"
        className="relative flex size-11 items-center justify-center rounded-full border border-[#d8e3f0] bg-white text-[#10233f] shadow-[0_8px_24px_rgba(15,23,42,0.05)] sm:size-12"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
        <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#ef4444] text-[11px] font-semibold text-white">
          3
        </span>
      </button>
      <div className="hidden h-10 w-px bg-[#d8e3f0] sm:block" />
      <div className="flex items-center gap-3 text-left">
        <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#10233f] to-[#2f9364] text-[14px] font-semibold text-white sm:size-12">
          {initials}
        </span>
        <div className="hidden sm:block">
          <div className="text-[12px] text-[#64748b]">Welcome back,</div>
          <div className="text-[15px] font-semibold text-[#10233f]">{displayName}</div>
        </div>
        <ChevronDown className="hidden size-5 text-[#10233f] sm:block" />
      </div>
    </div>
  );
}

function ProfileSummary({ profile, displayName, phoneNumber, initials, ordersValue, walletValue }) {
  return (
    <section className="rounded-[18px] border border-[#dbe5f1] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="rounded-[16px] bg-[#31566a] px-5 py-6 text-white">
        <div className="flex items-center gap-4">
          <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#10233f] to-[#2f9364] text-[24px] font-semibold shadow-[0_16px_34px_rgba(0,0,0,0.18)]">
            {initials}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[24px] font-semibold">{displayName}</h2>
            <p className="mt-2 text-[15px] font-medium text-white/75">{phoneNumber}</p>
            <p className="mt-1 truncate text-[13px] text-white/65">{profile?.email || 'Email not available'}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 text-center">
        <ProfileStat label="Orders" value={ordersValue} />
        <ProfileStat label="Wallet" value={walletValue} bordered />
        <ProfileStat label="Rating" value={profile?.rating || '4.8'} bordered />
      </div>
    </section>
  );
}

function SwitchRoleCard({ sellerType }) {
  const role = sellerType === 'buyer' ? 'Buyer' : 'Seller';

  return (
    <section className="rounded-[18px] border border-[#dbe5f1] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-[14px] bg-[#edf7f1] text-[#5e9b7b]">
            <Repeat className="size-6" />
          </span>
          <div>
            <h2 className="text-[21px] font-semibold text-[#31566a]">Switch Role</h2>
            <p className="mt-1 text-[15px] text-[#737373]">Currently acting as {role}</p>
          </div>
        </div>
        <button type="button" className="min-h-[46px] rounded-[12px] border border-[#c8dfd5] bg-[#f4fbf7] px-6 text-[15px] font-semibold text-[#356b57]">
          Switch to Buyer
        </button>
      </div>
    </section>
  );
}

function ProfileStat({ label, value, bordered = false }) {
  return (
    <div className={bordered ? 'border-l border-[#e5e7eb] px-3' : 'px-3'}>
      <div className="truncate text-[24px] font-semibold leading-none text-[#31566a]">{value}</div>
      <div className="mt-2 text-[13px] font-semibold text-[#737373]">{label}</div>
    </div>
  );
}

function ProfileSection({ title, children }) {
  return (
    <section>
      <h2 className="px-1 text-[21px] font-semibold text-[#31566a]">{title}</h2>
      <div className="mt-4 overflow-hidden rounded-[18px] border border-[#dbe5f1] bg-white px-5 py-2 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
        {children}
      </div>
    </section>
  );
}

function ProfileMenuItem({ Icon, label, value }) {
  return (
    <button type="button" className="flex min-h-[70px] w-full items-center gap-5 border-b border-[#edf2ef] text-left last:border-b-0">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[#f8faf9] text-[#31566a]">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1 text-[17px] font-medium text-[#31566a]">{label}</span>
      {value && <span className="text-[14px] font-medium text-[#8a8f98]">{value}</span>}
      <ChevronRight className="size-5 shrink-0 text-[#c4c4c4]" />
    </button>
  );
}

async function handleLogout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'same-origin',
    });
  } finally {
    clearAuthSession();
    window.location.href = '/';
  }
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
