'use client';

import {
  getUserLikedCount,
  getUserLikedEpisodes,
} from '@/services/episodes.service';
import Link from 'next/link';
import React from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { HeartIcon, TrophyIcon, UsersIcon } from '@heroicons/react/24/solid';
import {
  getUserSubscribedPodcasts,
  getUserSubscriptionsCount,
} from '@/services/podcasts.service';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import { auth } from '@/firebase/firebaseConfig';

const DashboardHome: React.FC = () => {
  const { currentUser } = auth;

  const { data: likedCount } = useSWR(
    currentUser ? `user_liked_count_${currentUser.uid}` : null,
    () => currentUser && getUserLikedCount(currentUser.uid)
  );

  const { data: episodesData, isLoading: episodesIsLoading } = useSWR(
    currentUser ? `user_liked_episodes_${currentUser.uid}` : null,
    () => currentUser && getUserLikedEpisodes(currentUser.uid, 3)
  );

  const { data: subscriptionsCount } = useSWR(
    currentUser ? `user_subscriptions_count_${currentUser.uid}` : null,
    () => currentUser && getUserSubscriptionsCount(currentUser.uid)
  );
  const { data: podcastsData, isLoading: podcastsIsLoading } = useSWR(
    currentUser ? `user_subscribed_podcasts_${currentUser.uid}` : null,
    () => currentUser && getUserSubscribedPodcasts(currentUser.uid, 3)
  );

  return (
    <div className="page__responsive">
      <h2 className="page__title">Home</h2>
      <div className="flex flex-col gap-6">
        <div className="flex items-center">
          <UsersIcon className="w-5 h-5 text-defaultBlue-400" />
          <h3 className="text-lg font-medium ml-2">Subscriptions</h3>
        </div>
        <div className="flex flex-wrap gap-12 w-full">
          {podcastsIsLoading || !podcastsData ? (
            <p>Loading subscriptions...</p>
          ) : podcastsData.length === 0 ? (
            <div className="w-full h-full text-lg flex">
              No subscriptions found.
            </div>
          ) : (
            podcastsData.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/podcasts/${item.id}`}
                className="flex flex-col items-start justify-start w-full sm:w-72 hover:scale-105 cursor-pointer transition-all"
              >
                <div className="w-full h-72 relative">
                  <Image
                    src={item.photo}
                    alt="Podcast"
                    fill={true}
                    className="rounded-lg shadow-md object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="flex w-full justify-between pt-2.5">
                  <div>
                    <h3 className="font-medium text-md">{item.title}</h3>
                    <h2 className="text-sm">{item.host}</h2>
                  </div>
                </div>
              </Link>
            ))
          )}
          {subscriptionsCount != null && subscriptionsCount > 3 && (
            <Link
              href={'/dashboard/subscriptions'}
              className="flex items-center justify-center w-72 h-72 border shadow-sm border-gray-300 rounded-lg  hover:scale-105 transition-all"
            >
              <div className="flex items-center justify-center">
                <PlusCircleIcon className="w-4 h-4" />
                <p className="ml-1">Show more</p>
              </div>
            </Link>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="flex items-center">
          <HeartIcon className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-medium ml-2">Liked episodes</h3>
        </div>
        <div className="flex flex-wrap gap-12 w-full">
          {episodesIsLoading || !episodesData ? (
            <p>Loading episodes...</p>
          ) : episodesData.length === 0 ? (
            <div className="w-full h-full text-lg flex">No episodes found.</div>
          ) : (
            episodesData.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/podcasts/${item.podcastId}/${item.id}`}
                className="flex flex-col items-start justify-start w-full sm:w-72 hover:scale-105 cursor-pointer transition-all"
              >
                <div className="w-full h-72 relative">
                  <Image
                    src={item.photo}
                    alt="Episode"
                    fill={true}
                    className="rounded-lg shadow-md object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="flex w-full justify-between pt-2.5">
                  <div>
                    <h3 className="font-medium text-md">{item.title}</h3>
                    <h2 className="text-sm">{item.podcastTitle}</h2>
                  </div>
                </div>
              </Link>
            ))
          )}
          {likedCount != null && likedCount > 3 && (
            <Link
              href={'/dashboard/liked'}
              className="flex items-center justify-center w-72 h-72 border shadow-sm border-gray-300 rounded-lg hover:scale-105 transition-all"
            >
              <div className="flex items-center justify-center">
                <PlusCircleIcon className="w-4 h-4" />
                <p className="ml-1">Show more</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
