'use client';

import React from 'react';
import { useAuth } from '@/contexts/authContext';
import { doSignOut } from '@/contexts/authContext/auth';
import { useRouter } from 'next/navigation';

const DashboardHome: React.FC = () => {
  const { userLoggedIn, currentUser } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await doSignOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', (error as Error).message);
    }
  };

  if (!userLoggedIn) {
    return null;
  }

  return (
    <div>
      Welcome back, {userLoggedIn && currentUser?.email}
      <div>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    </div>
  );
};

export default DashboardHome;
