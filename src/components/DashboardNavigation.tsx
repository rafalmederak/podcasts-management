import Image from 'next/image';
import React from 'react';
import Logo from '@/assets/logo/podcasts-logo.webp';
import {
  Cog6ToothIcon,
  HeartIcon,
  HomeIcon,
  MicrophoneIcon,
  PresentationChartBarIcon,
  QuestionMarkCircleIcon,
  TrophyIcon,
  UsersIcon,
} from '@heroicons/react/24/solid';
import { usePathname } from 'next/navigation';
import NavLink from './NavLink';

const dashboardLink = '/dashboard';

const dashboardNavLinks: NavItem[] = [
  {
    title: 'Home',
    icon: HomeIcon,
    link: dashboardLink + '/home',
  },
  {
    title: 'Podcasts',
    icon: MicrophoneIcon,
    link: dashboardLink + '/podcasts',
  },
  {
    title: 'Subscriptions',
    icon: UsersIcon,
    link: dashboardLink + '/subscriptions',
  },
  {
    title: 'Liked',
    icon: HeartIcon,
    link: dashboardLink + '/liked',
  },
  {
    title: 'Ranking',
    icon: PresentationChartBarIcon,
    link: dashboardLink + '/ranking',
  },
  {
    title: 'Achievments',
    icon: TrophyIcon,
    link: dashboardLink + '/achievments',
  },
];

const dashboardSupportLinks = [
  {
    title: 'Settings',
    icon: Cog6ToothIcon,
    link: dashboardLink + '/settings',
  },
  {
    title: 'Help',
    icon: QuestionMarkCircleIcon,
    link: dashboardLink + '/help',
  },
];

const DashboardNavigation = () => {
  const pathname = usePathname();
  return (
    <div className="flex flex-col justify-between py-10 px-6 items-center w-52 min-h-screen border-gray-100 border-r-2">
      <div className="flex flex-col items-center">
        <Image
          src={Logo}
          alt="logo"
          priority={true}
          className="w-28 rounded-lg drop-shadow-lg shadow-black"
        />
        <div className="flex flex-col gap-5 mt-16">
          {dashboardNavLinks.map((item) => (
            <NavLink item={item} pathname={pathname} key={item.link} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5 mt-16">
        {dashboardSupportLinks.map((item) => (
          <NavLink item={item} pathname={pathname} key={item.link} />
        ))}
      </div>
    </div>
  );
};

export default DashboardNavigation;
