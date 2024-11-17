import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Image from 'next/image';
import { User } from 'firebase/auth';

//types
import { Trophy, UserTrophy } from '@/types/trophy';

//icons
import {
  CheckCircleIcon,
  LockClosedIcon,
  TrophyIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';

//services
import {
  addEpisodeUserTrophie,
  getUserTrophy,
} from '@/services/trophies.service';
import { addTrophyLevelToUser } from '@/services/users.service';

type TaskDetailProps = {
  trophy: Trophy;
  setIsTrophyDetailOpen: Dispatch<SetStateAction<boolean>>;
  isUserTrophy: (itemId: Trophy['id']) => boolean | null;
  currentUser: User;
};

const TrophyDetail = ({
  trophy,
  setIsTrophyDetailOpen,
  isUserTrophy,
  currentUser,
}: TaskDetailProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userTrophy, setUserTrophy] = useState<UserTrophy | null>(null);

  const handleRadioChange = (value: number) => {
    if (selectedAnswer !== value) {
      setSelectedAnswer(value);
    }
  };

  const achieveTask = async () => {
    try {
      await addEpisodeUserTrophie(trophy.id, currentUser.uid, selectedAnswer!);
    } catch (error) {
      console.error(error);
    }
  };

  const finishTask = (trophyLevel: number) => {
    achieveTask();
    addTrophyLevelToUser(currentUser.uid, trophyLevel);
    setIsTrophyDetailOpen(false);
  };

  useEffect(() => {
    const fetchUserTrophy = async () => {
      try {
        const userTrophyData = await getUserTrophy(trophy.id, currentUser.uid);
        setUserTrophy(userTrophyData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserTrophy();
  }, []);

  return (
    <div className="fixed w-[38rem] flex flex-col h-full gap-4 bg-white z-10 top-0 right-0 border-gray-100 border-l-2 rounded-sm p-6">
      <div className="flex items-start justify-between">
        <div className="flex gap-4 w-full h-full">
          <div className="w-40 h-full min-h-40">
            <div className="w-40 h-full relative">
              <Image
                src={trophy.photo}
                alt="Trophy"
                fill={true}
                className="rounded-lg shadow-md object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
          <div className="flex flex-col w-full gap-4 justify-between">
            <div className="flex flex-col  gap-2">
              <h3 className="font-semibold">{trophy.title}</h3>
              <TrophyIcon
                className={`w-4 h-4 ${
                  trophy.level === 1
                    ? 'text-amber-700'
                    : trophy.level === 2
                    ? 'text-gray-400'
                    : 'text-yellow-500'
                }`}
              />

              <p className="line-clamp-4">{trophy.description}</p>
            </div>

            <div
              className={`flex h-12 w-full items-center ${
                isUserTrophy(trophy.id) ? 'bg-green-200' : 'bg-gray-200'
              } p-2 rounded-lg items-center`}
            >
              {isUserTrophy(trophy.id) ? (
                <CheckCircleIcon className="w-6 h-6  text-green-500" />
              ) : (
                <LockClosedIcon className="w-5 h-5 text-gray-400 " />
              )}
              <p className="ml-1">
                {isUserTrophy(trophy.id) ? 'Achieved' : 'Unachieved'}
              </p>
            </div>
          </div>
        </div>

        <XMarkIcon
          className="w-6 h-6 cursor-pointer"
          onClick={() => setIsTrophyDetailOpen(false)}
        />
      </div>
      <span className="bg-gray-200 w-full h-[2px]"></span>
      <div className="flex flex-col gap-6">
        <div key={trophy.id} className="flex flex-col gap-6">
          <div>{trophy.task.question}</div>
          {trophy.task.type === 'radio' && (
            <div className="flex gap-5 flex-wrap">
              {trophy.task.radioOptions?.map((option, index) => (
                <label
                  key={option}
                  className={`${
                    selectedAnswer === option || userTrophy?.answer == option
                      ? 'bg-blue-400'
                      : 'bg-blue-200'
                  } min-w-8  p-4 h-8 flex items-center justify-center rounded-sm transition-all ${
                    !userTrophy?.answer
                      ? 'hover:bg-blue-400 cursor-pointer '
                      : ''
                  }`}
                >
                  <input
                    disabled={!!userTrophy?.answer}
                    type="radio"
                    className="hidden"
                    name={`input-${index}`}
                    value={option}
                    onChange={() => handleRadioChange(option)}
                    checked={selectedAnswer === option}
                    required
                  />
                  {option}
                </label>
              ))}
            </div>
          )}
          <span className="bg-gray-200 w-full h-[3px]"></span>
        </div>
        {!isUserTrophy(trophy.id) && (
          <button
            onClick={() => finishTask(trophy.level)}
            disabled={!selectedAnswer}
            className={`${
              !selectedAnswer
                ? 'bg-gray-200'
                : 'bg-green-200 hover:bg-green-300  transition-all'
            } flex p-2 rounded-lg w-40 items-center justify-center `}
          >
            <CheckCircleIcon
              className={`w-6 h-6  ${
                !selectedAnswer ? 'text-gray-400' : 'text-green-500'
              }`}
            />
            <p className="ml-1">Finish task</p>
          </button>
        )}
      </div>
    </div>
  );
};

export default TrophyDetail;
