// components/ProtectedRoute.tsx
'use client';

import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RootState } from '@/store/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('Young-Adult' | 'Student')[];
}

export default function ProtectedRoute({ 
  children, 
  allowedUserTypes 
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if user type is allowed for this route
    if (allowedUserTypes && user && !allowedUserTypes.includes(user.type)) {
      router.push('/unauthorized'); // or redirect to appropriate page
      return;
    }
  }, [isAuthenticated, user, router, allowedUserTypes]);

  // Show loading or nothing while redirecting
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Check user type authorization
  if (allowedUserTypes && user && !allowedUserTypes.includes(user.type)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Unauthorized access</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}