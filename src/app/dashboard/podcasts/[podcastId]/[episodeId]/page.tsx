'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

//icons
import {
  ArrowLeftCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  TrophyIcon,
} from '@heroicons/react/24/solid';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

//logos
import YTMusicLogo from '@/assets/logos/yt_music_full_rgb_black.png';
import ApplePodcastsLogo from '@/assets/logos/Apple_Podcasts_Icon_RGB.svg';
import SpotifyLogo from '@/assets/logos/Spotify_Primary_Logo_RGB_Green.png';

//services
import {
  addLikeToEpisode,
  getEpisode,
  getEpisodeUserLike,
  removeLikeFromEpisode,
} from '@/services/episodes.service';
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
  if (!currentUser) return null;
  const params = useParams<{ podcastId: string; episodeId: string }>();

  const [isEpisodeLiked, setIsEpisodeLiked] = useState(false);

  //audio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

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

  useEffect(() => {
    if (episodeData && audioRef.current) {
      const audio = audioRef.current;
      audio.ontimeupdate = () => setAudioCurrentTime(audio.currentTime);
      audio.onloadedmetadata = () => setAudioDuration(audio.duration);
      audio.onended = () => handleAudioEnd();
    }
  }, [episodeData]);

  useEffect(() => {
    episodeLikes ? setIsEpisodeLiked(true) : setIsEpisodeLiked(false);
  }, [episodeLikes]);

  if (episodeError) {
    return <div>Error loading episode.</div>;
  }

  if (episodeIsLoading || !episodeData) {
    return <div>Loading episode...</div>;
  }

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

    return trophiesData.sort((a, b) => {
      const isATrophyUser = userTrophyIds.includes(a.id);
      const isBTrophyUser = userTrophyIds.includes(b.id);

      if (isATrophyUser && !isBTrophyUser) return -1;
      if (!isATrophyUser && isBTrophyUser) return 1;

      return b.level - a.level;
    });
  };

  //functions

  const handleLike = async () => {
    try {
      await addLikeToEpisode(episodeData.id, currentUser.uid);
      setIsEpisodeLiked(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnlike = async () => {
    try {
      await removeLikeFromEpisode(episodeData.id, currentUser.uid);
      setIsEpisodeLiked(false);
    } catch (error) {
      console.error(error);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && audioDuration) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickPosition = event.clientX - rect.left;
      const clickPercentage = clickPosition / rect.width;
      const newTime = clickPercentage * audioDuration;
      audioRef.current.currentTime = newTime;
      setAudioCurrentTime(newTime);
    }
  };

  const handleAudioEnd = () => {
    setIsAudioPlaying(false);
    setAudioCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
                    <p className="ml-1">{formatTime(audioDuration)}</p>
                  </div>
                  <div className="flex items-center">
                    <TrophyIcon className="w-4 h-4" />
                    <p className="ml-1">{trophiesData?.length}</p>
                  </div>
                </div>
                <button
                  onClick={isEpisodeLiked ? handleUnlike : handleLike}
                  className="flex items-center cursor-pointer rounded-md hover:bg-gray-100 transition-all ml-5 pl-1 py-1 pr-2"
                >
                  {isEpisodeLiked ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <PlusCircleIcon className="w-5 h-5" />
                  )}
                  <p className="ml-1 ">
                    {isEpisodeLiked ? 'Liked' : 'Add to liked'}
                  </p>
                </button>
              </div>
            </div>
            <p>{episodeData.description}</p>
            <div className="flex gap-2">
              <div className="flex items-start ">
                <button onClick={togglePlay}>
                  {isAudioPlaying ? (
                    <PauseCircleIcon className="w-8 h-8 text-defaultBlue-300 cursor-pointer" />
                  ) : (
                    <PlayCircleIcon className="w-8 h-8 text-defaultBlue-300 cursor-pointer" />
                  )}
                </button>
                <audio
                  ref={audioRef}
                  src={episodeData.audioURL}
                  preload="auto"
                />
                <div className="flex flex-col mt-[3px] ml-1">
                  <div
                    className="w-96 h-6 rounded-lg bg-gray-200 relative cursor-pointer border-gray-200 border-2"
                    onClick={handleProgressClick}
                  >
                    <div
                      className={`h-full bg-white rounded-md w-[${
                        (audioCurrentTime / audioDuration) * 100
                      }%]`}
                      style={{
                        width: `${(audioCurrentTime / audioDuration) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm">
                      {formatTime(audioCurrentTime)}
                    </span>
                    <span className="text-sm">{formatTime(audioDuration)}</span>
                  </div>
                </div>
              </div>
              <div className="flex mt-[3px] gap-2">
                {episodeData.spotifyURL && (
                  <a
                    href={episodeData.spotifyURL}
                    target="_blank"
                    className="w-6 h-6 relative cursor-pointer"
                  >
                    <Image
                      src={SpotifyLogo}
                      alt="Spotify"
                      fill={true}
                      className="object-cover rounded-md p-1 bg-black"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </a>
                )}
                {episodeData.applePodcastsURL && (
                  <a
                    href={episodeData.applePodcastsURL}
                    target="_blank"
                    className="w-6 h-6 relative cursor-pointer"
                  >
                    <Image
                      src={ApplePodcastsLogo}
                      alt="Apple Podcasts"
                      fill={true}
                      className="object-cover rounded-md"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </a>
                )}
                {episodeData.ytMusicURL && (
                  <a
                    href={episodeData.ytMusicURL}
                    target="_blank"
                    className=" h-6 w-24 relative cursor-pointer"
                  >
                    <Image
                      src={YTMusicLogo}
                      alt="YouTube Music"
                      fill={true}
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </a>
                )}
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
