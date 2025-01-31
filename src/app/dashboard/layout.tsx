'use client';
import DashboardNavigation from '@/components/DashboardNavigation';
import DashboardTopBar from '@/components/DashboardTopBar';
import LoadingComponent from '@/components/Loading';
import { auth } from '@/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useEffect, useState } from 'react';

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (!user) {
            return router.push('/login');
          }

          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  if (loading) {
    return <LoadingComponent />;
  }
  return (
    <>
      <div className="flex">
        <DashboardNavigation />
        <div className="flex flex-col w-full">
          <DashboardTopBar />
          <div className="page__width w-full flex px-8 lg:px-12 py-11 2xl:h-[calc(100vh-58px)]">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;
