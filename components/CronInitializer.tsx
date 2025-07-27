// components/CronInitializer.tsx
'use client';

import { getCronService } from '@/lib/services/cronService';
import { useEffect } from 'react';

export default function CronInitializer() {
  useEffect(() => {
    const cron = getCronService();
    console.log('Cron initialized from frontend');
  }, []);

  return null; // This component doesn't render anything
}