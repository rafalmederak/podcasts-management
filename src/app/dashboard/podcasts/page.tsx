'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';

//types
import { Podcast } from '@/types/podcast';

//services
import { getPodcasts } from '@/services/podcasts.service';

//icons
import { MagnifyingGlassIcon, TrophyIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

const PodcastsPage = () => {
  const { data } = useSWR('podcasts', getPodcasts);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter(
      (item: Podcast) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.host.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  return (
    <div className="flex flex-col w-full gap-10">
      <h2 className="page__title">Podcasts</h2>
      <div className="rounded-md w-full flex items-center max-w-96 md:w-[18rem] gap-x-1 px-3 py-2 text-sm shadow-sm ring-1 ring-inset ring-gray-200 focus:outline-none">
        <MagnifyingGlassIcon className="w-4 h-4" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-12 w-full">
        {filteredData.length === 0 ? (
          <div className="w-full h-full text-lg flex">No podcasts found.</div>
        ) : (
          filteredData.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/podcasts/${item.id}`}
              className="flex flex-col items-start justify-start w-96 hover:scale-105 cursor-pointer transition-all"
            >
              <div className="w-full h-72 relative">
                <Image
                  src={item.photo}
                  alt="Demo photo"
                  fill={true}
                  className="rounded-lg shadow-md object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="flex w-full justify-between pt-2.5">
                <div>
                  <h3 className="font-medium text-lg">{item.title}</h3>
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

export default PodcastsPage;
