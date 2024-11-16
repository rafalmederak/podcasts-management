'use client';

import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { useAuth } from '@/contexts/authContext';
import { getUserSubscribedPodcasts } from '@/services/podcasts.service';
import { TrophyIcon } from '@heroicons/react/24/solid';

const SubscriptionsPage = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const { data: podcastsData, isLoading: podcastsIsLoading } = useSWR(
    'user_subscribed_podcasts',
    () => getUserSubscribedPodcasts(currentUser.uid)
  );

  const filteredData = useMemo(() => {
    if (!podcastsData) return [];
    return podcastsData.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.host.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [podcastsData, searchQuery]);

  if (podcastsIsLoading || !podcastsData) {
    return (
      <div className="flex flex-col w-full gap-10 px-4">
        Loading subscriptions...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-10 px-4">
      <h2 className="page__title">Subscriptions</h2>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="flex flex-wrap gap-12 w-full">
        {filteredData.length === 0 ? (
          <div className="w-full h-full text-lg flex">
            No subscriptions found.
          </div>
        ) : (
          filteredData.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/podcasts/${item.id}`}
              className="flex flex-col items-start justify-start w-72 hover:scale-105 cursor-pointer transition-all"
            >
              <div className="w-72 h-72 relative">
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
                <div className="relative w-7 h-7 ml-2">
                  <TrophyIcon className="w-6 h-6 mr-[0.3rem]" />
                  <span className="absolute bottom-0 right-0 bg-defaultBeige-300 h-[1.1rem] min-w-[1.1rem] max-w-[1.6rem] p-[0.2rem] rounded-full flex items-center justify-center text-xs">
                    {item.totalTrophies}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
