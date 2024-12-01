'use client';

import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { getUserTrophies } from '@/services/trophies.service';
import { useAuth } from '@/contexts/authContext';
import { TrophyIcon } from '@heroicons/react/24/solid';

const AchievmentsPage = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const [searchQuery, setSearchQuery] = useState('');

  const { data: trophiesData, isLoading: trophiesIsLoading } = useSWR(
    `user_trophies_${currentUser.uid}`,
    () => getUserTrophies(currentUser.uid)
  );

  const filteredData = useMemo(() => {
    if (!trophiesData) return [];
    return trophiesData.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.episode.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trophiesData, searchQuery]);

  return (
    <div className="page__responsive">
      <h2 className="page__title">Achievments</h2>
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchTitle={'Search trophy or episode...'}
      />
      <div className="flex flex-wrap gap-x-[8%] gap-y-8 sm:gap-x-8 w-full">
        {trophiesIsLoading || !trophiesData ? (
          <p>Loading trophies...</p>
        ) : filteredData.length === 0 ? (
          <div className="w-full h-full text-lg flex">No trophies found.</div>
        ) : (
          filteredData
            .sort((a, b) => b.level - a.level)
            .map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/podcasts/${item.episode.podcastId}/${item.episodeId}`}
                className="flex flex-col items-start justify-start w-[46%] sm:w-48 hover:scale-105 cursor-pointer transition-all"
              >
                <div className="w-full h-48 relative">
                  <Image
                    src={item.photo}
                    alt="Trophy"
                    fill={true}
                    className="rounded-lg shadow-md object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="flex w-full items-start gap-4 justify-between pt-2.5">
                  <div className="flex flex-col">
                    <h3 className="font-medium text-md">{item.title}</h3>
                    <h2 className="text-sm">{item.episode.title}</h2>
                  </div>
                  <div>
                    <TrophyIcon
                      className={`w-4 h-4 mt-1 ${
                        item.level === 1
                          ? 'text-amber-700'
                          : item.level === 2
                          ? 'text-gray-400'
                          : 'text-yellow-500'
                      }`}
                    />
                  </div>
                </div>
              </Link>
            ))
        )}
      </div>
    </div>
  );
};

export default AchievmentsPage;
