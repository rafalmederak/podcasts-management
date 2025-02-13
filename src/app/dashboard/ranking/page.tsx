'use client';

import SearchBar from '@/components/SearchBar';
import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { PresentationChartBarIcon, StarIcon } from '@heroicons/react/24/solid';
import Trophy from '@/assets/ranking/trophy.jpg';
import UserInitialsLogo from '@/components/UserInitialsLogo';
import { auth } from '@/firebase/firebaseConfig';
import { getUsersAttributes } from '@/firebase/getUsers';

const RankingPage = () => {
  const { currentUser } = auth;
  if (!currentUser) return null;

  const [searchQuery, setSearchQuery] = useState('');

  const { data: usersData, isLoading: usersIsLoading } = useSWR(
    'usersAttributes',
    async () => {
      const userIdToken = await currentUser.getIdToken();
      return getUsersAttributes({ userIdToken });
    }
  );

  const rankedData = useMemo(() => {
    if (!usersData) return [];

    const sortedData = usersData.slice().sort((a, b) => b.level - a.level);

    let previousLevel = -1;
    let currentRank = 1;

    return sortedData.map((user, index) => {
      if (user.level !== previousLevel) {
        currentRank = index + 1;
        previousLevel = user.level;
      }

      return { ...user, rank: currentRank };
    });
  }, [usersData]);

  const filteredData = useMemo(() => {
    if (!rankedData) return [];
    return rankedData.filter(
      (item) =>
        item.displayName &&
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
          <div className="flex flex-col gap-4 2xl:h-[79vh] 2xl:overflow-y-auto 2xl:pr-4 pl-4 pt-2">
            {usersIsLoading || !usersData ? (
              <p>Loading users...</p>
            ) : filteredData.length === 0 ? (
              <div className="w-full h-full text-lg flex">No users found.</div>
            ) : (
              filteredData.map((item) => (
                <div
                  key={item.uid}
                  className="flex relative items-center justify-center hover:scale-[1.015] bg-gray-100 transition-all py-1.5 px-3 rounded-lg cursor-default gap-x-1.5"
                >
                  {item.uid == currentUser?.uid && (
                    <StarIcon className="absolute w-4 h-4 -top-2 -left-2 text-yellow-400" />
                  )}
                  <p className="min-w-4 text-left">{item.rank}</p>
                  <div className="w-10">
                    {item.photoURL ? (
                      <div className="w-10 h-10 relative">
                        <Image
                          src={item.photoURL}
                          alt="User"
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
                    <h3 className="font-regular text-md">{item.displayName}</h3>
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
