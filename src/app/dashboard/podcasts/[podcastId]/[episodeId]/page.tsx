'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
import TrophyDetail from '@/components/trophy/TrophyDetail';

//types
import { Trophy, UserTrophy } from '@/types/trophy';

//services
import {
  deleteEpisode,
  getEpisode,
  getEpisodeUserLike,
} from '@/services/episodes.service';
import { getPodcast } from '@/services/podcasts.service';
import {
  getEpisodeTrophies,
  getEpisodeUserTrophies,
} from '@/services/trophies.service';
import Modal from '@/components/Modal';

const EpisodePage = () => {
  const { currentUser } = auth;
  if (!currentUser) return null;

  const params = useParams<{ podcastId: string; episodeId: string }>();

  const router = useRouter();

  const [isEpisodeLiked, setIsEpisodeLiked] = useState(false);
  const [isTrophyDetailOpen, setIsTrophyDetailOpen] = useState(false);
  const [selectedTrophy, setSelectedTrophy] = useState<Trophy | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isNotification, setIsNotification] = useState(false);

  const { data: podcastData } = useSWR(`${params.podcastId}`, getPodcast, {
    suspense: true,
  });

  const { data: episodeLikes } = useSWR(
    `episodeLikes_${params.episodeId}_${currentUser.uid}`,
    () => getEpisodeUserLike(params.episodeId, currentUser.uid),
    { revalidateOnFocus: true }
  );

  const { data: trophiesData } = useSWR(`episodes_${params.episodeId}`, () =>
    getEpisodeTrophies(params.episodeId)
  );

  const { data: userTrophiesData } = useSWR(
    `userTrophies_${currentUser?.uid}_${params.episodeId}`,
    () => getEpisodeUserTrophies(params.episodeId, currentUser?.uid)
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

  const openModal = (title: string, message: string, notification = false) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsNotification(notification);
    setIsModalOpen(true);
  };

  const closeNotification = (redirect: string) => {
    setIsModalOpen(false);
    router.push(redirect);
  };

  const handleDeleteEpisode = async () => {
    try {
      await deleteEpisode(params.episodeId, params.podcastId);
      openModal('Notification', 'Episode deleted successfully.', true);
    } catch (error) {
      console.error(error);
      openModal(
        'Error',
        'Failed to delete the episode. Please try again.',
        true
      );
    }
  };

  return (
    <div className="flex w-full flex-col items-start gap-6">
      {isTrophyDetailOpen && (
        <div className="fixed top-[56px] left-[208px] right-0 bottom-0 bg-black bg-opacity-10 backdrop-blur-sm z-10"></div>
      )}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
        <Link
          href={`/dashboard/podcasts/${params.podcastId}`}
          className="inline-flex items-center gap-2 md:mx-4 py-1 pl-2 pr-3 rounded-md hover:bg-defaultBlue-50 transition-all"
        >
          <ArrowLeftCircleIcon className="w-6 h-6 text-defaultBlue-300 cursor-pointer" />
          <h1 className="text-lg font-medium">{podcastData.title}</h1>
        </Link>
        {podcastData.userId === currentUser.uid && (
          <div className="flex gap-4 items-center md:px-4">
            <Link
              href={`/dashboard/podcasts/${params.podcastId}/${params.episodeId}/edit-episode`}
              className=" bg-defaultBlue-300 w-32 text-center text-white text-sm px-3 py-2 rounded-md shadow-md hover:bg-defaultBlue-500"
            >
              Edit Episode
            </Link>
            <button
              onClick={() =>
                openModal(
                  'Confirm Deletion',
                  `Are you sure you want to delete the episode "${episodeData?.title}"? This action cannot be undone.`,
                  false
                )
              }
              className="px-3 py-2 text-white text-sm bg-red-500 rounded hover:bg-red-700"
            >
              Delete Episode
            </button>
          </div>
        )}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={
          isNotification
            ? () => closeNotification(`/dashboard/podcasts/${params.podcastId}`)
            : () => setIsModalOpen(false)
        }
        title={modalTitle}
        message={modalMessage}
        onConfirm={!isNotification ? handleDeleteEpisode : undefined}
        confirmText={!isNotification ? 'Delete' : undefined}
        cancelText={isNotification ? 'Close' : 'Cancel'}
      />
      <div className="flex flex-col 2xl:flex-row gap-8 2xl:gap-6 w-full">
        <Episode
          episodeData={episodeData}
          isEpisodeLiked={isEpisodeLiked}
          setIsEpisodeLiked={setIsEpisodeLiked}
        />
        <div className="flex w-full 2xl:w-2/5 flex-col">
          <div className="flex justify-between items-center md:px-4">
            <h2 className="text-lg font-bold">Episode Tasks</h2>
            {podcastData.userId === currentUser.uid && (
              <div>
                <Link
                  href={`/dashboard/podcasts/${params.podcastId}/${episodeData.id}/add-trophy`}
                  className="text-sm bg-defaultBlue-300 text-white px-3 py-2 rounded-md shadow-md hover:scale-[1.025] transition-all"
                >
                  + Add Trophy
                </Link>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2  lg:max-h-[calc(100vh-250px)] 2xl:h-[calc(100vh-250px)] lg:overflow-y-auto md:px-4 pt-2 mt-2">
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
                  podcastDataUserId={podcastData.userId}
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
