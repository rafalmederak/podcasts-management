'use client';
import { getPodcast } from '@/services/podcasts.service';
import { useParams } from 'next/navigation';
import React from 'react';
import useSWR from 'swr';
import Image from 'next/image';
import { sampleEpisodesData, sampleRankingData } from '@/utils/sampleData';
import { TrophyIcon } from '@heroicons/react/24/solid';

const PodcastProfilePage = () => {
  const params = useParams<{ podcastId: string }>();

  const { data, mutate } = useSWR(`${params.podcastId}`, getPodcast, {
    suspense: true,
  });
  return (
    <div className="flex flex-col w-full gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="page__title">{data.title}</h1>
        <h2 className="text-md">{data.host}</h2>
      </div>
      <div className="flex gap-10 flex-wrap">
        <div className="flex flex-col xl:flex-row 2xl:w-2/3 w-full gap-10 ">
          <div className="flex flex-col flex-1 w-full xl:1/2 h-[calc(100vh-254px)] overflow-y-auto pb-4 pr-4">
            <div className="flex flex-col gap-6">
              <div className="w-full h-80 relative">
                <Image
                  src={data.photo}
                  alt="Demo photo"
                  fill={true}
                  className="rounded-lg shadow-md object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-medium">About</h2>
                <p>{data.description}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1 w-full pb-4 xl:1/2">
            <h2 className="text-lg font-medium pl-4">Episodes</h2>
            <div className="flex flex-col gap-2   h-[calc(100vh-290px)] overflow-y-auto pl-4 mt-2 pr-4">
              <div className="flex flex-col w-full gap-4">
                {sampleEpisodesData.map((item) => (
                  <div className="flex w-full border rounded p-4 gap-4 cursor-pointer hover:scale-[1.025] transition-all">
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
        <div className="flex flex-col flex-1 w-full pb-4 2xl:w-1/3">
          <h2 className="text-lg font-medium pl-0 2xl:pl-4">Ranking</h2>
          <div className="flex flex-col gap-2 w-full h-[calc(100vh-290px)] overflow-y-auto pl-0 2xl:pl-4 mt-2 pr-4">
            <div className="flex flex-col gap-4">
              {sampleRankingData
                .sort((a, b) => b.trophiesAmount - a.trophiesAmount)
                .map((item) => (
                  <div
                    key={item.name}
                    className="flex h-12 border rounded p-4 items-center justify-between cursor-pointer hover:scale-[1.025] transition-all"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 relative">
                        <Image
                          src={item.photo}
                          alt="Demo photo"
                          fill={true}
                          className="rounded-md shadow-md object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <p className="ml-2">{item.name}</p>
                    </div>
                    <div className="flex items-center">
                      <TrophyIcon className="w-4 h-4 mr-[2px]" />
                      <p>{item.trophiesAmount}</p>
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

export default PodcastProfilePage;
