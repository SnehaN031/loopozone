import { AccountTypeForm } from './AccountTypeForm';
import { AuthPageShell } from './AuthPageShell';

export function AccountTypePage() {
  return (
    <AuthPageShell variant="page">
      <AccountTypeForm />
    </AuthPageShell>
  );
}
