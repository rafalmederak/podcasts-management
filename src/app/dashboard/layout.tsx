'use client';
import DashboardNavigation from '@/components/DashboardNavigation';
import { useAuth } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useEffect } from 'react';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const { userLoggedIn } = useAuth();

  const router = useRouter();
  useEffect(() => {
    if (!userLoggedIn) {
      router.replace('/login');
    }
  }, [userLoggedIn, router]);
  return (
    <div className="flex">
      <DashboardNavigation />
      {children}
    </div>
  );
};

export default DashboardLayout;
