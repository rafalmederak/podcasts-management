import React from 'react';
import { auth } from '@/firebase/firebaseConfig';
import { doSignOut } from '@/contexts/authContext/auth';
import { usePathname, useRouter } from 'next/navigation';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Logo from '@/assets/logo/podcasts-logo.webp';
import {
  Popover,
  PopoverBackdrop,
  PopoverButton,
  PopoverPanel,
  Transition,
} from '@headlessui/react';
import DashboardTopBarItems from './DashboardTopBarItems';
import {
  dashboardNavLinks,
  dashboardSupportLinks,
} from './DashboardNavigation';
import NavLink from './NavLink';
import Link from 'next/link';

const DashboardTopBar = () => {
  const pathname = usePathname();
  const { currentUser } = auth;

  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await doSignOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', (error as Error).message);
    }
  };
  return (
    <Popover className="flex sticky top-0 h-14 z-10 bg-white w-full border-gray-100 border-b-2">
      <div className="page__width w-full flex items-center justify-between gap-8 py-4 px-8 md:px-12 lg:px-16">
        <Link href={'/dashboard/home'} className="md:hidden cursor-pointer">
          <Image
            src={Logo}
            alt="logo"
            priority={true}
            className=" w-8 h-8 rounded-lg drop-shadow-lg shadow-black"
          />
        </Link>
        <p className="hidden md:block">
          Welcome back,{' '}
          <span className="font-medium">{currentUser?.displayName}</span>
        </p>
        <PopoverButton>
          <Bars3Icon className="md:hidden w-8 h-8" />
        </PopoverButton>
        <div className="hidden md:flex gap-2 items-center">
          <DashboardTopBarItems handleSignOut={handleSignOut} />
        </div>
      </div>
      <PopoverBackdrop
        className={'md:hidden fixed inset-0 bg-black opacity-20'}
      />
      <Transition
        enter="ease-out duration-300"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <PopoverPanel
          className={
            'absolute inset-x-0 top-0 origin-top-right transform p-2 transition md:hidden'
          }
        >
          <div className="flex flex-col gap-4 bg-white rounded-lg shadow-lg ring-1 ring-slate-300 p-5 h-[calc(100vh-1rem)] lg:h-auto overflow-y-auto">
            <div className="flex w-full justify-between">
              <div className="flex items-center">
                <Image
                  src={Logo}
                  alt="logo"
                  priority={true}
                  className="md:hidden w-8 h-8 rounded-lg drop-shadow-lg shadow-black"
                />
                <p className="ml-2 text-sm">v1.0.0</p>
              </div>
              <PopoverButton className="h-6 w-6 ">
                <XMarkIcon className="h-6 w-6" />
              </PopoverButton>
            </div>
            <span className="border border-b-1" />
            <div className="flex w-full items-center justify-between gap-8">
              <p>
                Welcome back,{' '}
                <span className="font-medium">{currentUser?.displayName}</span>
              </p>
              <div className="flex gap-2 items-center">
                <DashboardTopBarItems handleSignOut={handleSignOut} />
              </div>
            </div>
            <span className="border border-b-1" />
            <div className="flex flex-col">
              <div className="flex flex-col gap-5 mt-2 mb-5">
                {dashboardNavLinks.map((item) => (
                  <PopoverButton key={item.link}>
                    <NavLink
                      item={item}
                      pathname={pathname}
                      popoverButton={true}
                    />
                  </PopoverButton>
                ))}
              </div>

              <div className="flex flex-col gap-5 mb-4">
                {dashboardSupportLinks.map((item) => (
                  <PopoverButton key={item.link}>
                    <NavLink
                      item={item}
                      pathname={pathname}
                      popoverButton={true}
                    />
                  </PopoverButton>
                ))}
              </div>
            </div>
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  );
};

export default DashboardTopBar;
