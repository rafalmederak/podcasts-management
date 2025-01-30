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
  deleteTrophy,
  getUserTrophy,
} from '@/services/trophies.service';
import { addTrophyLevelToUser } from '@/services/users.service';
import { User } from 'firebase/auth';
import TrophyBody from './TrophyBody';
import TrophyQuestionSection from './TrophyQuestionSection';
import { mutate } from 'swr';
import { useParams, useRouter } from 'next/navigation';
import Modal from '../Modal';
import Link from 'next/link';
import LoadingComponent from '../Loading';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

type TaskDetailProps = {
  trophy: Trophy;
  setIsTrophyDetailOpen: Dispatch<SetStateAction<boolean>>;
  isUserTrophy: (itemId: Trophy['id']) => boolean | null;
  currentUser: User;
  podcastDataUserId: string;
};

const TrophyDetail = ({
  podcastDataUserId,
  trophy,
  setIsTrophyDetailOpen,
  isUserTrophy,
  currentUser,
}: TaskDetailProps) => {
  const params = useParams<{ podcastId: string; episodeId: string }>();
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockedLoading, setIsBlockedLoading] = useState(true);

  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userTrophy, setUserTrophy] = useState<UserTrophy | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isNotification, setIsNotification] = useState(false);

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

  const finishTask = async (trophyLevel: number) => {
    if (isBlocked || selectedAnswer == null) {
      return;
    }

    if (trophy.goodAnswerIndex === selectedAnswer) {
      try {
        const userTrophyData = await getUserTrophy(trophy.id, currentUser.uid);

        const trophyData =
          userTrophyData && userTrophyData.answer === selectedAnswer;

        await addEpisodeUserTrophie(trophy.id, currentUser.uid, selectedAnswer);

        if (!trophyData) {
          addTrophyLevelToUser(currentUser.uid, trophyLevel);
        }

        mutate(`userTrophies_${currentUser.uid}_${params.episodeId}`);
        setIsTrophyDetailOpen(false);
      } catch (error) {
        console.error(error);
      }
    } else {
      await addEpisodeUserTrophie(trophy.id, currentUser.uid, -1);
      setSelectedAnswer(-1);
      setIsBlocked(true);
    }
  };

  useEffect(() => {
    const fetchUserTrophy = async () => {
      setIsBlockedLoading(true);
      try {
        const userTrophyData = await getUserTrophy(trophy.id, currentUser.uid);
        setUserTrophy(userTrophyData);

        if (userTrophyData?.blockedTime) {
          const blockedTime = userTrophyData.blockedTime.toDate();
          const now = new Date();

          //set one day of blocked time
          if (now < new Date(blockedTime.getTime() + 24 * 60 * 60 * 1000)) {
            setIsBlocked(true);
          } else {
            setIsBlocked(false);
          }
        }
      } catch (error) {
        console.error(error);
      }
      setIsBlockedLoading(false);
    };

    fetchUserTrophy();
  }, [trophy.id, currentUser.uid]);

  const openModal = (title: string, message: string, notification = false) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsNotification(notification);
    setIsModalOpen(true);
  };

  const closeNotification = () => {
    setIsModalOpen(false);
    setIsTrophyDetailOpen(false);
  };

  const podcastId = params.podcastId;
  const episodeId = params.episodeId;

  const handleDeleteTrophy = async () => {
    try {
      await deleteTrophy(trophy.id, { podcastId, episodeId });
      openModal('Notification', 'Trophy deleted successfully.', true);
      mutate(`episodes_${params.episodeId}`);
    } catch (error) {
      console.error(error);
      openModal(
        'Error',
        'Failed to delete the trophy. Please try again.',
        true
      );
    }
  };

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
            isBlocked={isBlocked}
            isUserTrophy={isUserTrophy}
          />
          {!isUserTrophy(trophy.id) &&
            podcastDataUserId !== currentUser.uid && (
              <div className="flex flex-col gap-4">
                {!isBlocked && (
                  <div className="flex items-center gap-1 bg-slate-100 p-2 rounded-md">
                    <InformationCircleIcon className="w-5 h-5" />
                    <p className="text-sm">
                      If you choose the wrong answer, you can choose again in 1
                      day.
                    </p>
                  </div>
                )}
                <button
                  onClick={() => finishTask(trophy.level)}
                  disabled={isBlocked || selectedAnswer! < 0}
                  className={`${
                    isBlockedLoading || isBlocked || selectedAnswer! < 0
                      ? 'bg-gray-200'
                      : 'bg-green-200 hover:bg-green-300  transition-all'
                  } flex p-2 rounded-lg w-40 items-center justify-center `}
                >
                  {!isBlockedLoading && (
                    <CheckCircleIcon
                      className={`w-6 h-6  ${
                        isBlocked || selectedAnswer! < 0
                          ? 'text-gray-400'
                          : 'text-green-500'
                      }`}
                    />
                  )}
                  <p className="ml-1">
                    {isBlockedLoading ? (
                      <LoadingComponent height="full" />
                    ) : isBlocked ? (
                      'Blocked'
                    ) : (
                      'Finish task'
                    )}
                  </p>
                </button>
                {isBlocked && (
                  <div className="flex items-center gap-1 bg-slate-100 p-2 rounded-md">
                    <InformationCircleIcon className="w-5 h-5 text-red-500" />
                    <p className="text-sm text-red-500">
                      You chose the wrong answer. You can choose the answer
                      again in 1 day.
                    </p>
                  </div>
                )}
              </div>
            )}
          {podcastDataUserId === currentUser.uid && (
            <div className="flex gap-4">
              <Link
                href={`/dashboard/podcasts/${params.podcastId}/${params.episodeId}/${trophy.id}/edit-trophy`}
                className=" bg-defaultBlue-300 w-32 text-center text-white px-3 py-2 rounded-md shadow-md hover:bg-defaultBlue-500"
              >
                Edit Trophy
              </Link>
              <button
                onClick={() =>
                  openModal(
                    'Confirm Deletion',
                    `Are you sure you want to delete the trophy "${trophy.title}"? This action cannot be undone.`,
                    false
                  )
                }
                className="px-4 py-2 text-white bg-red-500 rounded h-10 w-40 hover:bg-red-700"
              >
                Delete Trophy
              </button>
            </div>
          )}
          <Modal
            isOpen={isModalOpen}
            onClose={
              isNotification
                ? () => closeNotification()
                : () => setIsModalOpen(false)
            }
            title={modalTitle}
            message={modalMessage}
            onConfirm={!isNotification ? handleDeleteTrophy : undefined}
            confirmText={!isNotification ? 'Delete' : undefined}
            cancelText={isNotification ? 'Close' : 'Cancel'}
          />
        </div>
      </div>
    </div>
  );
};

export default TrophyDetail;
