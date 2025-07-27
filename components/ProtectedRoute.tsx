'use client';

import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RootState } from '@/store/store';
import { initializeAuth } from '@/store/slices/authSlice';
import Image from 'next/image';
import logo from '../public/5157fd0e-4183-4d5f-8cdd-5896e61b3f3f-removebg-preview.png'
import { PiggyBank, UserRoundX } from 'lucide-react';


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
          {/* <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div> */}
          <div className="relative">
            <div className="flex h-[200px] w-[200px] items-center justify-center rounded-full bg-primary shadow-lg ">
              <PiggyBank className="h-[100px] w-[100px] text-white" />
            </div>
            <div className="m-4 absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-200 animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading while redirecting to login
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          {/* <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div> */}
          <div className="relative">
            <div className="flex h-[200px] w-[200px] items-center justify-center rounded-full bg-primary shadow-lg">
              <PiggyBank className="h-[100px] w-[100px] text-white" />
            </div>
            <div className=" m-4 absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-200 animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Check user type authorization
  if (allowedUserTypes && user && !allowedUserTypes.includes(user.type)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="flex h-[200px] w-[200px] items-center justify-center rounded-full bg-primary shadow-lg">
            <UserRoundX className="h-[100px] w-[100px] text-white" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}