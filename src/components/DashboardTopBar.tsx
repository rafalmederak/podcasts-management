import React from 'react';
import { useAuth } from '@/contexts/authContext';
import { doSignOut } from '@/contexts/authContext/auth';
import { useRouter } from 'next/navigation';

const DashboardTopBar = () => {
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

  //   if (!userLoggedIn) {
  //     return null;
  //   }
  return (
    <div className="flex items-center justify-between w-full px-16 h-14 border-gray-100 border-b-2">
      <p>
        Welcome back,{' '}
        <span className="font-medium">
          {userLoggedIn && currentUser?.email}
        </span>
      </p>
      <div>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    </div>
  );
};

export default DashboardTopBar;
