'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugAuthPage() {
  const { data: session, status } = useSession();

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <strong>Status:</strong> {status}
            </div>
            <div>
              <strong>Session:</strong>
              <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
            <div>
              <strong>User Role:</strong> {session?.user?.role || 'Not set'}
            </div>
            <div>
              <strong>User ID:</strong> {session?.user?.id || 'Not set'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
