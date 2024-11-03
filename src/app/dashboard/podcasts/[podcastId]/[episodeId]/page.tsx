'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

//icons
import {
  ArrowLeftCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayCircleIcon,
  TrophyIcon,
} from '@heroicons/react/24/solid';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

//logos
import YTMusicLogo from '@/assets/logos/yt_music_full_rgb_black.png';
import ApplePodcastsLogo from '@/assets/logos/Apple_Podcasts_Icon_RGB.svg';
import SpotifyLogo from '@/assets/logos/Spotify_Primary_Logo_RGB_Green.png';

//services
import { getEpisode } from '@/services/episodes.service';
import { getPodcast } from '@/services/podcasts.service';
import {
  getEpisodeTrophies,
  getEpisodeUserTrophies,
} from '@/services/trophies.service';

//context
import { useAuth } from '@/contexts/authContext';

//types
import { Trophy, UserTrophy } from '@/types/trophy';

const EpisodePage = () => {
  const { currentUser } = useAuth();
  const params = useParams<{ podcastId: string; episodeId: string }>();

  const { data: trophiesData } = useSWR(`episodes_${params.episodeId}`, () =>
    getEpisodeTrophies(params.episodeId)
  );

  const { data: userTrophiesData } = useSWR(
    `userTrophies_${currentUser?.uid}`,
    () => getEpisodeUserTrophies(params.episodeId, currentUser?.uid)
  );

  const { data: podcastData } = useSWR(`${params.podcastId}`, getPodcast, {
    suspense: true,
  });

  const { data: episodeData } = useSWR(`${params.episodeId}`, getEpisode, {
    suspense: true,
  });

  const formattedEpisodeDescription = episodeData.longDescription
    ? episodeData.longDescription.replace(/\\n/g, '\n')
    : null;

  const isUserTrophy = (itemId: Trophy['id']) => {
    return userTrophiesData?.some(
      (trophy) =>
        trophy.userId === currentUser?.uid && trophy.trophyId === itemId
    );
  };

  const sortTrophies = (
    trophiesData: Trophy[],
    userTrophiesData: UserTrophy[]
  ): Trophy[] => {
    const userTrophyIds = userTrophiesData.map(
      (userTrophy) => userTrophy.trophyId
    );

    return trophiesData.slice().sort((a, b) => {
      const isATrophyUser = userTrophyIds.includes(a.id);
      const isBTrophyUser = userTrophyIds.includes(b.id);

      if (isATrophyUser && !isBTrophyUser) return -1;
      if (!isATrophyUser && isBTrophyUser) return 1;

      return b.level - a.level;
    });
  };

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <Link
        href={`/dashboard/podcasts/${params.podcastId}`}
        className="inline-flex items-center gap-2 mx-4 py-1 pl-2 pr-3 rounded-md hover:bg-defaultBlue-50 transition-all"
      >
        <ArrowLeftCircleIcon className="w-6 h-6 text-defaultBlue-300 cursor-pointer" />
        <h1 className="text-lg font-medium">{podcastData.title}</h1>
      </Link>
      <div className="flex flex-col 2xl:flex-row gap-8 2xl:gap-6 w-full">
        <div className="flex flex-col w-full 2xl:w-3/5 max-h-[calc(100vh-206px)] 2xl:h-[calc(100vh-206px)] overflow-y-auto 2xl:pb-4 px-4">
          <div className="flex flex-col gap-6">
            <div className="flex">
              <div className="w-52 h-52 relative">
                <Image
                  src={episodeData.photo}
                  alt="Demo photo"
                  fill={true}
                  className="rounded-lg shadow-md object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="flex flex-col items-start justify-between">
                <div className="flex flex-col gap-2 ml-5 p-1">
                  <h3 className="page__title">{episodeData.title}</h3>
                  <p className="text-md text-defaultBlue-300">
                    {episodeData.date}
                  </p>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4" />
                    <p className="ml-1">1h 22min</p>
                  </div>
                  <div className="flex items-center">
                    <TrophyIcon className="w-4 h-4" />
                    <p className="ml-1">{trophiesData?.length}</p>
                  </div>
                </div>
                <div className="flex items-center cursor-pointer rounded-md hover:bg-gray-100 transition-all ml-5 pl-1 py-1 pr-2">
                  <PlusCircleIcon className="w-5 h-5" />
                  <p className="ml-1">Add to liked</p>
                </div>
              </div>
            </div>
            <p>{episodeData.description}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <PlayCircleIcon className="w-8 h-8 text-defaultBlue-300 cursor-pointer" />
                <span className="w-96 h-6 ml-1 rounded-lg bg-gray-200"></span>
              </div>
              <div className="w-6 h-6 relative cursor-pointer">
                <Image
                  src={SpotifyLogo}
                  alt="Spotify"
                  fill={true}
                  className="object-cover rounded-md p-1 bg-black"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="w-6 h-6 relative cursor-pointer">
                <Image
                  src={ApplePodcastsLogo}
                  alt="Apple Podcasts"
                  fill={true}
                  className="object-cover rounded-md"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className=" h-6 w-24 relative cursor-pointer">
                <Image
                  src={YTMusicLogo}
                  alt="YouTube Music"
                  fill={true}
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
            <div className="whitespace-pre-line leading-normal">
              {formattedEpisodeDescription}
            </div>
          </div>
        </div>
        <div className="flex w-full 2xl:w-2/5 flex-col px-4 2xl:px-0">
          <h2 className="text-lg font-bold 2xl:px-4">Episode Tasks</h2>
          <div className="flex flex-col gap-2  max-h-[calc(100vh-206px)] 2xl:h-[calc(100vh-206px)] overflow-y-auto 2xl:px-4 pt-2">
            <div className="flex flex-col w-full gap-4 my-1">
              {trophiesData &&
                userTrophiesData &&
                sortTrophies(trophiesData, userTrophiesData).map((item) => (
                  <div
                    key={item.id}
                    className={`flex w-full relative border rounded p-4 gap-4 cursor-pointer hover:bg-gray-100 transition-all ${
                      isUserTrophy(item.id)
                        ? 'bg-green-50 border-green-200 hover:bg-green-100'
                        : ''
                    }`}
                  >
                    {isUserTrophy(item.id) && (
                      <CheckCircleIcon className="w-8 h-8 absolute -top-3 -right-3 text-green-500" />
                    )}
                    <div className="w-32 h-32">
                      <div className="w-32 h-full relative">
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
                      <TrophyIcon
                        className={`w-4 h-4 ${
                          item.level === 1
                            ? 'text-amber-700'
                            : item.level === 2
                            ? 'text-gray-400'
                            : 'text-yellow-500'
                        }`}
                      />

                      <p className="line-clamp-4">{item.description}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodePage;
