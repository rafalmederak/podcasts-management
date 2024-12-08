'use client';

import SearchBar from '@/components/SearchBar';
import { getUsers } from '@/services/users.service';
import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { PresentationChartBarIcon, StarIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/authContext';
import Trophy from '@/assets/ranking/trophy.jpg';
import UserInitialsLogo from '@/components/UserInitialsLogo';

const RankingPage = () => {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const [searchQuery, setSearchQuery] = useState('');

  const { data: usersData, isLoading: usersIsLoading } = useSWR(
    'users',
    getUsers
  );

  const rankedData = useMemo(() => {
    if (!usersData) return [];
    return usersData
      .slice()
      .sort((a, b) => b.level - a.level)
      .map((user, index) => ({ ...user, originalRank: index + 1 }));
  }, [usersData]);

  const filteredData = useMemo(() => {
    if (!rankedData) return [];
    return rankedData.filter((item) =>
      item.displayName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rankedData, searchQuery]);

  return (
    <div className="flex flex-col w-full gap-10 md:px-4">
      <h2 className="page__title">Ranking</h2>
      <div className="flex flex-col 2xl:flex-row w-full gap-8">
        <div className="flex flex-col gap-6 w-full 2xl:w-3/5">
          <div className="flex justify-between items-center ">
            <h3 className="font-medium text-lg w-1/2">All time</h3>
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
          <div className="flex flex-col flex-wrap gap-4 ">
            {usersIsLoading || !usersData ? (
              <p>Loading users...</p>
            ) : filteredData.length === 0 ? (
              <div className="w-full h-full text-lg flex">No users found.</div>
            ) : (
              filteredData
                .sort((a, b) => b.level - a.level)
                .map((item) => (
                  <div
                    key={item.uid}
                    className="flex relative items-center justify-center hover:scale-105 bg-gray-100 transition-all py-1.5 px-3 rounded-lg cursor-default gap-x-1.5"
                  >
                    {item.uid == currentUser?.uid && (
                      <StarIcon className="absolute w-4 h-4 -top-2 -left-2 text-yellow-400" />
                    )}
                    <p className="min-w-4 text-left">{item.originalRank}</p>
                    <div className="w-10">
                      {item.photoURL ? (
                        <div className="w-10 h-10 relative">
                          <Image
                            src={item.photoURL}
                            alt="Podcast"
                            fill={true}
                            className="rounded-lg shadow-md object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <UserInitialsLogo
                          rounded="lg"
                          height={10}
                          displayName={item.displayName}
                          width={10}
                        />
                      )}
                    </div>
                    <div className="flex w-full justify-between ml-2">
                      <h3 className="font-regular text-md">
                        {item.displayName}
                      </h3>
                      <div className="flex items-center gap-1">
                        <PresentationChartBarIcon className="w-5 h-5" />
                        <p>{item.level}</p>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
        <div className="w-full 2xl:w-2/5 h-96 md:h-[40rem] 2xl:h-[calc(100vh-218px)] relative">
          <Image
            src={Trophy}
            alt="Trophy"
            fill={true}
            className="rounded-lg shadow-md object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
    </div>
  );
};

export default RankingPage;
