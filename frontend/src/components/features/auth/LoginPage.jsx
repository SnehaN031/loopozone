import { LoginForm } from './LoginForm';
import { AuthPageShell } from './AuthPageShell';

export function LoginPage() {
  return (
    <AuthPageShell contentWidth="max-w-[940px]" promoMode="login">
      <LoginForm />
    </AuthPageShell>
  );
}
