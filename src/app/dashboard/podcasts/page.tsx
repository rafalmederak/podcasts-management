'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';

//types
import { Podcast } from '@/types/podcast';

//services
import { getPodcasts } from '@/services/podcasts.service';

//icons
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

const PodcastsPage = () => {
  const { data: podcastsData, isLoading: podcastsIsLoading } = useSWR(
    'podcasts',
    getPodcasts
  );

  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!podcastsData) return [];
    return podcastsData.filter(
      (item: Podcast) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.host.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [podcastsData, searchQuery]);

  return (
    <div className="page__responsive">
      <div className="flex justify-between items-center">
        <h2 className="page__title">Podcasts</h2>
        <Link
          href="/dashboard/podcasts/create-podcast"
          className="text-sm bg-defaultBlue-300 text-white px-3 py-2 rounded-md shadow-md hover:scale-[1.025] transition-all"
        >
          + Create podcast
        </Link>
      </div>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="flex flex-wrap gap-12 w-full overflow-y-auto">
        {podcastsIsLoading || !podcastsData ? (
          <p>Loading podcasts...</p>
        ) : filteredData.length === 0 ? (
          <div className="w-full h-full text-lg flex">No podcasts found.</div>
        ) : (
          filteredData.map((item) => (
            <Link
              key={item.id}
              href={`/dashboard/podcasts/${item.id}`}
              className="flex flex-col items-start justify-start w-full sm:w-96 hover:scale-105 cursor-pointer transition-all"
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
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default PodcastsPage;
