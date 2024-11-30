'use client';
import DashboardNavigation from '@/components/DashboardNavigation';
import DashboardTopBar from '@/components/DashboardTopBar';
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
    <>
      <div className="hidden md:flex">
        <DashboardNavigation />
        <div className="flex flex-col w-full">
          <DashboardTopBar />
          <div className="page__width w-full flex px-12 py-11 2xl:h-[calc(100vh-58px)]">
            {children}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen md:hidden">
        <p>Currently, the app is not designed for mobile devices.</p>
        <p>Please open an app in a larger window.</p>
      </div>
    </>
  );
};

export default DashboardLayout;
