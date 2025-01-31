'use client';

import SearchBar from '@/components/SearchBar';
import { getUserLikedEpisodes } from '@/services/episodes.service';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { auth } from '@/firebase/firebaseConfig';

const LikedPage = () => {
  const { currentUser } = auth;
  if (!currentUser) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const { data: episodesData, isLoading: episodesIsLoading } = useSWR(
    'user_liked_episodes',
    () => getUserLikedEpisodes(currentUser.uid)
  );

  const filteredData = useMemo(() => {
    if (!episodesData) return [];
    return episodesData.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.podcastTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [episodesData, searchQuery]);

  return (
    <div className="page__responsive">
      <h2 className="page__title">Liked episodes</h2>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="flex flex-wrap gap-12 w-full">
        {episodesIsLoading || !episodesData ? (
          <p>Loading episodes...</p>
        ) : filteredData.length === 0 ? (
          <div className="w-full h-full text-lg flex">No episodes found.</div>
        ) : (
          filteredData.map((item) => (
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
      </div>
    </div>
  );
};

export default LikedPage;
