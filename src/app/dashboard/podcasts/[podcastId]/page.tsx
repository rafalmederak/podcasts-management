'use client';
import { getPodcast } from '@/services/podcasts.service';
import { useParams } from 'next/navigation';
import React from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { StarIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { getPodcastEpisodes } from '@/services/episodes.service';
import { getPodcastRanking } from '@/services/trophies.service';
import { useAuth } from '@/contexts/authContext';

const PodcastProfilePage = () => {
  const { currentUser } = useAuth();

  const params = useParams<{ podcastId: string }>();

  const { data: rankingData } = useSWR(
    params.podcastId ? `ranking_${params.podcastId}` : null,
    () => getPodcastRanking(params.podcastId)
  );

  const { data: episodesData } = useSWR(
    params.podcastId ? `episodes_${params.podcastId}` : null,
    () => getPodcastEpisodes(params.podcastId)
  );

  const { data: podcastData, mutate } = useSWR(
    `${params.podcastId}`,
    getPodcast,
    {
      suspense: true,
    }
  );

  return (
    <div className="flex flex-col w-full gap-10">
      <div className="flex flex-col gap-3 px-4">
        <h1 className="page__title">{podcastData.title}</h1>
        <h2 className="text-md">{podcastData.host}</h2>
      </div>
      <div className="flex gap-8 2xl:gap-6 flex-wrap">
        <div className="flex flex-col xl:flex-row 2xl:w-2/3 w-full gap-8 2xl:gap-6 ">
          <div className="flex flex-col flex-1 w-full xl:1/2 max-h-[calc(100vh-254px)] 2xl:h-[calc(100vh-254px)] overflow-y-auto 2xl:pb-4 px-4">
            <div className="flex flex-col gap-6">
              <div className="w-full h-80 relative">
                <Image
                  src={podcastData.photo}
                  alt="Demo photo"
                  fill={true}
                  className="rounded-lg shadow-md object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-medium">About</h2>
                <p>{podcastData.description}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col xl:flex-1 w-full 2xl:pb-4 xl:1/2">
            <h2 className="text-lg font-medium px-4">Episodes</h2>
            <div className="flex flex-col gap-2  max-h-[calc(100vh-290px)] 2xl:h-[calc(100vh-290px)] overflow-y-auto px-4 pt-2">
              <div className="flex flex-col w-full gap-4 my-1">
                {episodesData?.map((item) => (
                  <div
                    key={item.id}
                    className="flex w-full border rounded p-4 gap-4 cursor-pointer hover:bg-gray-100 transition-all"
                  >
                    <div className="w-40 h-full">
                      <div className="w-40 h-full relative">
                        <Image
                          src={item.photo}
                          alt="Demo photo"
                          fill={true}
                          className="rounded-lg shadow-md object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col w-full gap-2">
                      <h3 className="font-semibold">{item.title}</h3>
                      <h4 className="text-defaultBlue-400">{item.date}</h4>
                      <p className="line-clamp-4">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 w-full 2xl:pb-4 2xl:w-1/3">
          <h2 className="text-lg font-medium px-4">Ranking</h2>
          <div className="flex flex-col gap-2 w-full max-h-[calc(100vh-290px)] 2xl:h-[calc(100vh-290px)]  overflow-y-auto  px-4 pt-2">
            <div className="flex flex-col gap-4 my-1">
              {rankingData?.length == 0 ? (
                <div>
                  <p>Currently there is no ranking for this podcast.</p>
                </div>
              ) : (
                rankingData?.map((item, index) => (
                  <div
                    key={item.displayName}
                    className={`flex h-12 border rounded p-4 items-center justify-between relative `}
                  >
                    {item.userId == currentUser?.uid && (
                      <StarIcon className="absolute w-4 h-4 -top-2 -left-2 text-yellow-500" />
                    )}
                    <div className="flex items-center gap-x-2">
                      <p className="min-w-4 text-left">{index + 1}</p>
                      <div className="w-8 h-8 relative">
                        {item.photoUrl ? (
                          <Image
                            src={item.photoUrl}
                            alt="Demo photo"
                            fill={true}
                            className="rounded-md shadow-md object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <p className="flex items-center justify-center rounded-md shadow-md w-8 h-8 text-center border">
                            {item.displayName
                              .split(' ')
                              .map((displayName: string) => displayName[0])
                              .join('')
                              .toUpperCase()}
                          </p>
                        )}
                      </div>
                      <p className="ml-1">{item.displayName}</p>
                    </div>
                    <div className="flex items-center">
                      <TrophyIcon className="w-4 h-4 mr-[2px]" />
                      <p>{item.trophiesCount}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PodcastProfilePage;
