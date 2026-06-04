import { AuthPageShell } from './AuthPageShell';
import { SignInForm } from './SignInForm';

export function SignInPage({ verifiedType = '', verifiedValue = '' }) {
  return (
    <AuthPageShell contentWidth="max-w-[940px]" promoMode="signIn">
      <SignInForm verifiedType={verifiedType} verifiedValue={verifiedValue} />
    </AuthPageShell>
  );
}
