import React from 'react';
import { useAuth } from '@/contexts/authContext';
import { doSignOut } from '@/contexts/authContext/auth';
import { useRouter } from 'next/navigation';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';

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
          {userLoggedIn && currentUser?.displayName}
        </span>
      </p>
      <div className="flex gap-2 items-center">
        <div className="relative w-8 h-8 rounded-md shadow-md">
          <Image
            src={currentUser?.photoURL || ''}
            alt="User photo"
            fill={true}
            className="rounded-lg object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <ArrowLeftStartOnRectangleIcon
          onClick={handleSignOut}
          className="w-8 h-8 p-1 cursor-pointer  hover:bg-gray-100 transition-all rounded-md"
        />
      </div>
    </div>
  );
};

export default DashboardTopBar;
