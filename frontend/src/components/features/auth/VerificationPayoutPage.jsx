import { VerificationPayoutForm } from './VerificationPayoutForm';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';

export function VerificationPayoutPage() {
  return (
    <>
      <MarketingHeader active="" />
      <div className="pt-[86px]">
        <VerificationPayoutForm />
      </div>
      <MarketingFooter />
    </>
  );
}
