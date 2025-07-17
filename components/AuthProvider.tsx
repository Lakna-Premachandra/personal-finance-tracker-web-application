'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth } from '@/store/slices/authSlice';
import { RootState } from '@/store/store';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isInitialized) {
      dispatch(initializeAuth());
    }
  }, [dispatch, isInitialized, mounted]);

  // Always render children, but auth will be properly initialized after hydration
  return <>{children}</>;
}