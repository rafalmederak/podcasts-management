'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Image from 'next/image';
import { auth } from '@/firebase/firebaseConfig';

//icons
import {
  ArrowLeftCircleIcon,
  CheckCircleIcon,
  TrophyIcon,
} from '@heroicons/react/24/solid';

//components
import Episode from '@/components/Episode';
import TrophyDetail from '@/components/TrophyDetail';

//types
import { Trophy, UserTrophy } from '@/types/trophy';

//services
import { getEpisode, getEpisodeUserLike } from '@/services/episodes.service';
import { getPodcast } from '@/services/podcasts.service';
import {
  getEpisodeTrophies,
  getEpisodeUserTrophies,
} from '@/services/trophies.service';

const EpisodePage = () => {
  const { currentUser } = auth;
  if (!currentUser) return null;

  const params = useParams<{ podcastId: string; episodeId: string }>();

  const [isEpisodeLiked, setIsEpisodeLiked] = useState(false);
  const [isTrophyDetailOpen, setIsTrophyDetailOpen] = useState(false);
  const [selectedTrophy, setSelectedTrophy] = useState<Trophy | null>(null);

  const { data: trophiesData } = useSWR(`episodes_${params.episodeId}`, () =>
    getEpisodeTrophies(params.episodeId)
  );

  const { data: userTrophiesData } = useSWR(
    `userTrophies_${currentUser?.uid}_${params.episodeId}`,
    () => getEpisodeUserTrophies(params.episodeId, currentUser?.uid)
  );

  const { data: podcastData } = useSWR(`${params.podcastId}`, getPodcast, {
    suspense: true,
  });

  const { data: episodeLikes } = useSWR(
    `episodeLikes_${params.episodeId}_${currentUser.uid}`,
    () => getEpisodeUserLike(params.episodeId, currentUser.uid),
    { revalidateOnFocus: true }
  );

  const {
    data: episodeData,
    error: episodeError,
    isLoading: episodeIsLoading,
  } = useSWR(`${params.episodeId}`, () => getEpisode(params.episodeId));

  const isUserTrophy = (itemId: Trophy['id']) => {
    if (!userTrophiesData) return null;
    return userTrophiesData.some(
      (trophy) =>
        trophy.userId === currentUser?.uid && trophy.trophyId === itemId
    );
  };

  const handleTrophyClick = (trophy: Trophy) => {
    setSelectedTrophy(trophy);
    setIsTrophyDetailOpen(true);
  };

  const sortTrophies = (
    trophiesData: Trophy[],
    userTrophiesData: UserTrophy[]
  ): Trophy[] => {
    const userTrophyIds = userTrophiesData.map(
      (userTrophy) => userTrophy.trophyId
    );

    return trophiesData.sort((a, b) => {
      const isATrophyUser = userTrophyIds.includes(a.id);
      const isBTrophyUser = userTrophyIds.includes(b.id);

      if (isATrophyUser && !isBTrophyUser) return -1;
      if (!isATrophyUser && isBTrophyUser) return 1;

      return b.level - a.level;
    });
  };

  useEffect(() => {
    episodeLikes ? setIsEpisodeLiked(true) : setIsEpisodeLiked(false);
  }, [episodeLikes]);

  if (episodeError) {
    return <div>Error loading episode.</div>;
  }

  if (episodeIsLoading || !episodeData) {
    return <div>Loading episode...</div>;
  }

  return (
    <div className="flex w-full flex-col items-start gap-6">
      {isTrophyDetailOpen && (
        <div className="fixed top-[56px] left-[208px] right-0 bottom-0 bg-black bg-opacity-10 backdrop-blur-sm z-10"></div>
      )}
      <Link
        href={`/dashboard/podcasts/${params.podcastId}`}
        className="inline-flex items-center gap-2 md:mx-4 py-1 pl-2 pr-3 rounded-md hover:bg-defaultBlue-50 transition-all"
      >
        <ArrowLeftCircleIcon className="w-6 h-6 text-defaultBlue-300 cursor-pointer" />
        <h1 className="text-lg font-medium">{podcastData.title}</h1>
      </Link>
      <div className="flex flex-col 2xl:flex-row gap-8 2xl:gap-6 w-full">
        <Episode
          episodeData={episodeData}
          isEpisodeLiked={isEpisodeLiked}
          setIsEpisodeLiked={setIsEpisodeLiked}
        />
        <div className="flex w-full 2xl:w-2/5 flex-col">
          <h2 className="text-lg font-bold md:px-4">Episode Tasks</h2>
          <div className="flex flex-col gap-2  lg:max-h-[calc(100vh-206px)] 2xl:h-[calc(100vh-206px)] lg:overflow-y-auto md:px-4 pt-2">
            <div className="flex flex-col w-full gap-4 my-1 relative">
              {trophiesData?.length == 0 && (
                <p>Currently there are no trophies for this episode.</p>
              )}
              {trophiesData &&
                userTrophiesData &&
                sortTrophies(trophiesData, userTrophiesData).map((item) => (
                  <div
                    onClick={() => handleTrophyClick(item)}
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
              {isTrophyDetailOpen && selectedTrophy && (
                <TrophyDetail
                  currentUser={currentUser}
                  trophy={selectedTrophy}
                  setIsTrophyDetailOpen={setIsTrophyDetailOpen}
                  isUserTrophy={isUserTrophy}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodePage;
