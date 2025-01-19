import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

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
import { User } from 'firebase/auth';
import TrophyBody from './TrophyBody';
import TrophyQuestionSection from './TrophyQuestionSection';
import { mutate } from 'swr';
import { useParams } from 'next/navigation';

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
  const params = useParams<{ podcastId: string; episodeId: string }>();
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

    mutate(`userTrophies_${currentUser.uid}_${params.episodeId}`);

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
    <div className="max-w-[1920px] w-full flex 2xl:justify-end">
      <div className="fixed right-0 2xl:right-auto w-full md:w-[calc(100vw-212px)] 2xl:w-[38rem] flex flex-col h-full gap-4 bg-white z-10 top-[56px]  border-gray-100 border-l-2 rounded-sm px-8 py-6 md:px-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col w-full h-full gap-4">
            <TrophyBody trophy={trophy} />
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
          <XMarkIcon
            className="w-6 h-6 cursor-pointer"
            onClick={() => setIsTrophyDetailOpen(false)}
          />
        </div>
        <span className="bg-gray-200 w-full h-[2px]"></span>
        <div className="flex flex-col gap-6">
          <TrophyQuestionSection
            trophy={trophy}
            selectedAnswer={selectedAnswer}
            userTrophy={userTrophy}
            handleRadioChange={handleRadioChange}
          />
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
    </div>
  );
};

export default TrophyDetail;
