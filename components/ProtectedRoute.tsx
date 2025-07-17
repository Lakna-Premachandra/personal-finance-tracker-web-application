'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RootState } from '@/store/store';
import { initializeAuth } from '@/store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: ('Young-Adult' | 'Student')[];
}

export default function ProtectedRoute({ 
  children, 
  allowedUserTypes 
}: ProtectedRouteProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user, isInitialized } = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Initialize auth from sessionStorage if not already initialized
    if (!isInitialized) {
      dispatch(initializeAuth());
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Check if user type is allowed for this route
    if (allowedUserTypes && user && !allowedUserTypes.includes(user.type)) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, user, router, allowedUserTypes, isInitialized, dispatch, mounted]);

  // Show loading during hydration or while initializing
  if (!mounted || !isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-blue-500 font-semibold text-lg">Finance Tracker...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting to login
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-blue-500">Redirecting to login...</p>
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