'use client';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import useSWR from 'swr';

//icons
import {
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
  removeLikeFromEpisode,
} from '@/services/episodes.service';
import { getEpisodeTrophies } from '@/services/trophies.service';

import { auth } from '@/firebase/firebaseConfig';
import { EpisodeType } from '@/types/episode';

type EpisodeProps = {
  creation?: boolean;
  episodeData: EpisodeType;
  isEpisodeLiked?: boolean;
  setIsEpisodeLiked?: Dispatch<SetStateAction<boolean>>;
};

const Episode = ({
  creation,
  episodeData,
  isEpisodeLiked,
  setIsEpisodeLiked,
}: EpisodeProps) => {
  const { currentUser } = auth;
  if (!currentUser) return null;
  const params = useParams<{ podcastId: string; episodeId: string }>();

  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

  const { data: trophiesData } = useSWR(`episodes_${params.episodeId}`, () =>
    getEpisodeTrophies(params.episodeId)
  );

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    photo,
    title,
    date,
    description,
    longDescription,
    spotifyURL,
    applePodcastsURL,
    ytMusicURL,
  } = episodeData;

  const formattedEpisodeDescription = longDescription
    ? longDescription.replace(/\\n/g, '\n')
    : null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleAudioEnd = () => {
    setIsAudioPlaying(false);
    setAudioCurrentTime(0);
  };

  useEffect(() => {
    if (episodeData && audioRef.current) {
      const audio = audioRef.current;
      audio.ontimeupdate = () => setAudioCurrentTime(audio.currentTime);
      audio.onloadedmetadata = () => setAudioDuration(audio.duration);
      audio.onended = () => handleAudioEnd();
    }
  }, [episodeData]);

  const handleLike = async () => {
    try {
      await addLikeToEpisode(episodeData.id, currentUser.uid);
      setIsEpisodeLiked && setIsEpisodeLiked(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUnlike = async () => {
    try {
      await removeLikeFromEpisode(episodeData.id, currentUser.uid);
      setIsEpisodeLiked && setIsEpisodeLiked(false);
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

  const audioURL: string | undefined =
    typeof episodeData.audioURL === 'string' ? episodeData.audioURL : undefined;

  return (
    <div
      className={`flex flex-col w-full ${
        creation ? '2xl:w-full' : '2xl:w-3/5'
      } lg:max-h-[calc(100vh-206px)] 2xl:h-[calc(100vh-206px)] lg:overflow-y-auto 2xl:pb-4 md:px-4`}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-52 h-52 relative">
            {photo ? (
              <Image
                src={photo}
                alt="Demo photo"
                fill={true}
                className="rounded-lg shadow-md object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="flex items-center justify-center rounded-lg shadow-md object-cover h-full">
                <i>Episode Image</i>
              </div>
            )}
          </div>
          <div className="flex flex-col items-start justify-between">
            <div className="flex flex-col gap-2 mt-4 md:mt-0 md:ml-5 p-1">
              {title ? (
                <h3 className="page__title">{title}</h3>
              ) : (
                <i className="page__title">Episode Title</i>
              )}
              <p className="text-md text-defaultBlue-300">
                {date ? date : <i>dd/mm/yyyy</i>}
              </p>
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4" />
                <p className="ml-1">{formatTime(audioDuration)}</p>
              </div>
              <div className="flex items-center">
                <TrophyIcon className="w-4 h-4" />
                <p className="ml-1">
                  {trophiesData ? trophiesData?.length : 0}
                </p>
              </div>
            </div>
            {!creation && (
              <button
                onClick={isEpisodeLiked ? handleUnlike : handleLike}
                className="flex items-center cursor-pointer rounded-md hover:bg-gray-100 transition-all md:ml-5 pl-1 py-1 pr-2"
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
            )}
          </div>
        </div>
        <p>{description ? description : <i>Episode description</i>}</p>
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="flex items-start ">
            <button onClick={togglePlay}>
              {isAudioPlaying ? (
                <PauseCircleIcon className="w-8 h-8 text-defaultBlue-300 cursor-pointer" />
              ) : (
                <PlayCircleIcon className="w-8 h-8 text-defaultBlue-300 cursor-pointer" />
              )}
            </button>
            <audio ref={audioRef} src={audioURL} preload="auto" />
            <div className="flex flex-col mt-[3px] w-full md:w-96 ml-1">
              <div
                className="group w-full md:w-96 h-6 rounded-lg bg-gray-200 relative border-gray-200 border-2"
                onClick={handleProgressClick}
              >
                <div
                  className={`h-full bg-white group-hover:bg-blue-500 transition-all rounded-md w-[${
                    (audioCurrentTime / audioDuration) * 100
                  }%]`}
                  style={{
                    width: `${(audioCurrentTime / audioDuration) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm">{formatTime(audioCurrentTime)}</span>
                <span className="text-sm">{formatTime(audioDuration)}</span>
              </div>
            </div>
          </div>

          <div className="flex mt-[3px] gap-2">
            {spotifyURL && (
              <a
                href={spotifyURL}
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
            {applePodcastsURL && (
              <a
                href={applePodcastsURL}
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
            {ytMusicURL && (
              <a
                href={ytMusicURL}
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
          {formattedEpisodeDescription ? (
            formattedEpisodeDescription
          ) : (
            <i>Episode long description</i>
          )}
        </div>
      </div>
    </div>
  );
};

export default Episode;
