'use client';

import { useRouter } from 'next/navigation';
import { OperatorRegistrationStepper } from '@/components/operator-registration-stepper';
import { AuthHeader } from '@/components/auth-header';

export default function OperatorRegistrationPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // Redirect to login page after successful registration
    router.push('/auth/signin?message=registration-success');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      <div className="flex-1 flex items-center justify-center p-4">
        <OperatorRegistrationStepper onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
