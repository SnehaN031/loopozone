import { SignInPage } from '@/components/features/auth/SignInPage';

export default function SignInRoute({ searchParams }) {
  const verifiedType = getVerifiedType(searchParams?.verified);
  const verifiedValue = getVerifiedValue(searchParams, verifiedType);

  return <SignInPage verifiedType={verifiedType} verifiedValue={verifiedValue} />;
}

function getVerifiedType(value) {
  return value === 'mobile' || value === 'email' ? value : '';
}

function getVerifiedValue(searchParams, verifiedType) {
  if (verifiedType === 'mobile') {
    return searchParams?.mobile ?? '';
  }

  if (verifiedType === 'email') {
    return searchParams?.email ?? '';
  }

  return '';
}
