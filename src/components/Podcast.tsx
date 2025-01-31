import React from 'react';
import Image from 'next/image';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

type PodcastProps = {
  subscribeButton?: boolean;
  isPodcastSubscribed?: boolean;
  handleUnsubscribe?: () => void;
  handleSubscribe?: () => void;
  photo: string;
  description: string;
  creation?: boolean;
};

const Podcast = ({
  isPodcastSubscribed,
  handleUnsubscribe,
  handleSubscribe,
  photo,
  description,
  subscribeButton,
  creation,
}: PodcastProps) => {
  return (
    <div
      className={`flex flex-col flex-1 w-full xl:1/2 lg:max-h-[calc(100vh-254px)] 2xl:h-[calc(100vh-254px)] lg:overflow-y-auto ${
        !creation && '2xl:pb-4 md:px-4'
      } ${creation && 'pr-4'}`}
    >
      <div className="flex flex-col items-start gap-3">
        <div className="w-full max-w-[30rem] 2xl:max-w-full h-80 relative">
          {photo ? (
            <Image
              src={photo}
              alt="Podcast"
              fill={true}
              className="rounded-lg shadow-md object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center rounded-lg shadow-md object-cover h-full">
              <i>Podcast Image</i>
            </div>
          )}
        </div>
        {subscribeButton && (
          <button
            onClick={isPodcastSubscribed ? handleUnsubscribe : handleSubscribe}
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
        )}

        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-medium">About</h2>
          {description ? <p>{description}</p> : <i>Description</i>}
        </div>
      </div>
    </div>
  );
};

export default Podcast;
