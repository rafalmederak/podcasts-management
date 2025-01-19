import React from 'react';
import Image from 'next/image';
import { TrophyIcon } from '@heroicons/react/24/solid';
import { Trophy } from '@/types/trophy';

type TrophyBodyProps = {
  creation?: boolean;
  trophy: Trophy;
};

const TrophyBody = ({ creation, trophy }: TrophyBodyProps) => {
  console.log(trophy);
  return (
    <div className="flex flex-col md:flex gap-4 w-full h-full">
      <div className="w-40 min-h-40">
        <div className="w-40 h-full relative">
          {trophy.photo ? (
            <Image
              src={trophy.photo}
              alt="Trophy"
              fill={true}
              className="rounded-lg shadow-md object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center rounded-lg shadow-md w-full h-40">
              <i>Trophy image</i>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col w-full gap-4 justify-between">
        <div className="flex flex-col  gap-2">
          <h3 className="font-semibold">
            {trophy.title ? trophy.title : <i>Trophy title</i>}
          </h3>

          <TrophyIcon
            className={`w-4 h-4 ${
              trophy.level === 1
                ? 'text-amber-700'
                : trophy.level === 2
                ? 'text-gray-400'
                : 'text-yellow-500'
            }`}
          />

          <p className="line-clamp-4">
            {trophy.description ? (
              trophy.description
            ) : (
              <i>Trophy Description</i>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrophyBody;
