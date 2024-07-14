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
import Link from 'next/link';

const dashboardLink = '/dashboard';

const dashboardNavLinks = [
  {
    title: 'Home',
    icon: HomeIcon,
    link: dashboardLink + '/home',
    active: true,
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
            <Link href={item.link} key={item.link}>
              <div
                className={`nav__item ${
                  item.active && 'bg-defaultBlue-300 text-white'
                }`}
              >
                {<item.icon className="w-5 h-5" />}
                <p className="ml-2 font-regular">{item.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5 mt-16">
        {dashboardSupportLinks.map((item) => (
          <Link href={item.link} key={item.link}>
            <div className="nav__item">
              {<item.icon className="w-5 h-5" />}
              <p className="ml-2 font-regular">{item.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardNavigation;
