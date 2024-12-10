'use client';
import {
  getPodcast,
  getPodcastUserSubscription,
  subscribePodcast,
  unsubscribePodcast,
} from '@/services/podcasts.service';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import {
  CheckCircleIcon,
  StarIcon,
  TrophyIcon,
} from '@heroicons/react/24/solid';
import { getPodcastEpisodes } from '@/services/episodes.service';
import { getPodcastRanking } from '@/services/trophies.service';
import Link from 'next/link';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import UserInitialsLogo from '@/components/UserInitialsLogo';
import { auth } from '@/firebase/firebaseConfig';

const PodcastProfilePage = () => {
  const { currentUser } = auth;
  if (!currentUser) return null;

  const params = useParams<{ podcastId: string }>();
  const [isPodcastSubscribed, setIsPodcastSubscribed] = useState(false);

  const { data: podcastUserSubscription } = useSWR(
    `podcastUserSubscription_${params.podcastId}_${currentUser.uid}`,
    () => getPodcastUserSubscription(params.podcastId, currentUser.uid),
    { revalidateOnFocus: true }
  );

  useEffect(() => {
    podcastUserSubscription
      ? setIsPodcastSubscribed(true)
      : setIsPodcastSubscribed(false);
  }, [podcastUserSubscription]);

  const { data: episodesData, isLoading: episodesIsLoading } = useSWR(
    params.podcastId ? `episodes_${params.podcastId}` : null,
    () => getPodcastEpisodes(params.podcastId)
  );

  const { data: rankingData, isLoading: rankingIsLoading } = useSWR(
    params.podcastId ? `ranking_${params.podcastId}` : null,
    () => getPodcastRanking(params.podcastId)
  );

  const { data: podcastData, mutate } = useSWR(
    `${params.podcastId}`,
    getPodcast,
    {
      suspense: true,
    }
  );

  const handleSubscribe = async () => {
    try {
      await subscribePodcast(podcastData.id, currentUser.uid);
      setIsPodcastSubscribed(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribePodcast(podcastData.id, currentUser.uid);
      setIsPodcastSubscribed(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col w-full gap-10">
      <div className="flex flex-col gap-3 md:px-4">
        <h1 className="page__title">{podcastData.title}</h1>
        <h2 className="text-md">{podcastData.host}</h2>
      </div>
      <div className="flex gap-8 2xl:gap-6 flex-wrap">
        <div className="flex flex-col xl:flex-row 2xl:w-2/3 w-full gap-8 2xl:gap-6 ">
          <div className="flex flex-col flex-1 w-full xl:1/2 lg:max-h-[calc(100vh-254px)] 2xl:h-[calc(100vh-254px)] lg:overflow-y-auto 2xl:pb-4 md:px-4">
            <div className="flex flex-col items-start gap-3">
              <div className="w-full h-80 relative">
                <Image
                  src={podcastData.photo}
                  alt="Demo photo"
                  fill={true}
                  className="rounded-lg shadow-md object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <button
                onClick={
                  isPodcastSubscribed ? handleUnsubscribe : handleSubscribe
                }
                className="flex items-center cursor-pointer rounded-md hover:bg-gray-100 transition-all pl-1 py-1 pr-2"
              >
                {isPodcastSubscribed ? (
                  <CheckCircleIcon className="w-5 h-5 text-defaultBlue-300" />
                ) : (
                  <PlusCircleIcon className="w-5 h-5" />
                )}
                <p className="ml-1 ">
                  {isPodcastSubscribed ? 'Subscribed' : 'Subscribe'}
                </p>
              </button>

              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-medium">About</h2>
                <p>{podcastData.description}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col xl:flex-1 w-full 2xl:pb-4 xl:1/2">
            <h2 className="text-lg font-medium md:px-4">Episodes</h2>
            <div className="flex flex-col gap-2  lg:max-h-[calc(100vh-290px)] 2xl:h-[calc(100vh-290px)] lg:overflow-y-auto md:px-4 pt-2">
              <div className="flex flex-col w-full gap-4 my-1">
                {episodesIsLoading || !episodesData ? (
                  <p>Loading episodes...</p>
                ) : (
                  episodesData?.map((item) => (
                    <Link
                      href={`/dashboard/podcasts/${params.podcastId}/${item.id}`}
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
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-1 w-full 2xl:pb-4 2xl:w-1/3">
          <h2 className="text-lg font-medium md:px-4">Ranking</h2>
          <div className="flex flex-col gap-2 w-full lg:max-h-[calc(100vh-290px)] 2xl:h-[calc(100vh-290px)]  lg:overflow-y-auto pl-2  md:px-4 pt-2">
            <div className="flex flex-col gap-4 my-1">
              {rankingIsLoading || !rankingData ? (
                <p>Loading users...</p>
              ) : rankingData?.length == 0 ? (
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
                        {item.photoURL ? (
                          <Image
                            src={item.photoURL}
                            alt="Demo photo"
                            fill={true}
                            className="rounded-md shadow-md object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <UserInitialsLogo
                            displayName={item.displayName}
                            rounded="md"
                            width={8}
                            height={8}
                          />
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
