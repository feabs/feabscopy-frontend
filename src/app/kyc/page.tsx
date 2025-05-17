import AuthLayout from '@/components/layout/AuthLayout';
import KycForm from '@/components/auth/KycForm';

export default function KycPage() {
  return (
    <AuthLayout 
      title="KYC Verification"
      description="Upload your identification documents to complete your profile."
    >
      <KycForm />
    </AuthLayout>
  );
}
