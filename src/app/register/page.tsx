import AuthLayout from '@/components/layout/AuthLayout';
import RegistrationForm from '@/components/auth/RegistrationForm';

export default function RegisterPage() {
  return (
    <AuthLayout 
      title="Create an Account"
      description="Join FeabsCopy and start your investment journey today."
    >
      <RegistrationForm />
    </AuthLayout>
  );
}
