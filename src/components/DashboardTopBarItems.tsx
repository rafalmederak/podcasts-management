import { ExtendedUser } from '@/types/user';
import {
  ArrowLeftStartOnRectangleIcon,
  PresentationChartBarIcon,
} from '@heroicons/react/16/solid';
import Image from 'next/image';
import React from 'react';
import UserInitialsLogo from './UserInitialsLogo';

type TopBarItemsProps = {
  userLevel: number;
  currentUser: ExtendedUser;
  handleSignOut: () => void;
};

const DashboardTopBarItems = ({
  userLevel,
  currentUser,
  handleSignOut,
}: TopBarItemsProps) => {
  return (
    <>
      <div className="flex items-center gap-1 hover:bg-gray-100 p-1 rounded-md transition-all">
        <PresentationChartBarIcon className="w-6 h-6" />
        <p>{userLevel}</p>
      </div>
      {currentUser.photoURL ? (
        <div className="relative w-8 h-8 rounded-md shadow-md">
          <Image
            src={currentUser?.photoURL}
            alt="User photo"
            fill={true}
            className="rounded-lg object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <UserInitialsLogo
          displayName={currentUser.displayName}
          rounded="md"
          width={8}
          height={8}
        />
      )}

      <ArrowLeftStartOnRectangleIcon
        onClick={handleSignOut}
        className="w-8 h-8 p-1 cursor-pointer  hover:bg-gray-100 transition-all rounded-md"
      />
    </>
  );
};

export default DashboardTopBarItems;
