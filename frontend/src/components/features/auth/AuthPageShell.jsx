import { BrandLogo } from './BrandLogo';
import { AuthPromoPanel } from './AuthPromoPanel';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';

export function AuthPageShell({ children, contentWidth = 'max-w-[650px]', promoMode = '', variant = 'card' }) {
  if (variant === 'page') {
    return (
      <>
        <MarketingHeader active="" />
        <main className="min-h-screen bg-white pt-[86px] font-sans text-[#111827]">
          <section className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
            {children}
          </section>
        </main>
        <MarketingFooter />
      </>
    );
  }

  return (
    <>
      <MarketingHeader active="" />
      <main className="min-h-screen bg-[#f8fafc] pt-[86px] font-sans text-[#111827]">
        <section className="flex min-h-[calc(100vh-86px)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className={`min-w-0 w-full ${contentWidth}`}>
            {promoMode ? (
              <div className="grid min-w-0 overflow-hidden rounded-[18px] border border-[#e5e7eb] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] md:grid-cols-[270px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)]">
                <AuthPromoPanel mode={promoMode} />
                <div className="min-w-0 overflow-hidden p-6 sm:p-8 md:p-10">{children}</div>
              </div>
            ) : (
              <div className="rounded-[18px] border border-[#e5e7eb] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8 md:p-10">
                <div className="mb-8">
                  <BrandLogo tone="dark" />
                </div>
                {children}
              </div>
            )}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}
