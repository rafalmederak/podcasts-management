import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/authContext';
import { doSignOut } from '@/contexts/authContext/auth';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftStartOnRectangleIcon,
  PresentationChartBarIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

const DashboardTopBar = () => {
  const { currentUser } = useAuth();

  const router = useRouter();

  const [userLevel, setUserLevel] = useState<number>(0);

  useEffect(() => {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserLevel(data.level);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser]);

  if (!currentUser) return null;

  const handleSignOut = async () => {
    try {
      await doSignOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', (error as Error).message);
    }
  };
  return (
    <div className="flex h-14 w-full border-gray-100 border-b-2">
      <div className="page__width w-full flex items-center justify-between  px-16">
        <p>
          Welcome back,{' '}
          <span className="font-medium">{currentUser.displayName}</span>
        </p>
        <div className="flex gap-2 items-center">
          <div className="flex items-center gap-1 hover:bg-gray-100 p-1 rounded-md transition-all">
            <PresentationChartBarIcon className="w-6 h-6" />
            <p>{userLevel}</p>
          </div>
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
    </div>
  );
};

export default DashboardTopBar;
