'use client';

import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <EnvelopeIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent you a magic link to sign in
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Click the link in your email to complete the sign-in process.
                The link will expire in 10 minutes.
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <a href="/auth/signin" className="font-medium text-blue-600 hover:text-blue-500">
                  try again
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
