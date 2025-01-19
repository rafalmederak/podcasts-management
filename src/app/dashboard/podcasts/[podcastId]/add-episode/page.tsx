'use client';

import React, { FormEvent, useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Episode from '@/components/Episode';
import { getPodcast } from '@/services/podcasts.service';
import { v4 as uuidv4 } from 'uuid';
import { EpisodeType } from '@/types/episode';
import { auth } from '@/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { addEpisode } from '@/services/episodes.service';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import LoadingComponent from '@/components/Loading';
import { handlePhotoChange, uploadFile } from '@/utils/photoChange';

const AddEpisode = () => {
  const { currentUser } = auth;
  const router = useRouter();

  const [photoURL, setPhotoURL] = useState<string>('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [spotifyURL, setSpotifyURL] = useState('');
  const [applePodcastsURL, setApplePodcastsURL] = useState('');
  const [ytMusicURL, setYtMusicURL] = useState('');
  const [audioURL, setAudioURL] = useState<string | ArrayBuffer | null>('');
  const params = useParams<{ podcastId: string }>();
  const episodeId = uuidv4();

  const [isLoading, setIsLoading] = useState(false);

  const { data: podcastData } = useSWR(`${params.podcastId}`, getPodcast, {
    suspense: true,
  });

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAudioURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const episodeData: EpisodeType = {
    photo: photoURL,
    title,
    date,
    description,
    longDescription,
    spotifyURL,
    applePodcastsURL,
    ytMusicURL,
    audioURL: audioURL,
    id: episodeId,
    podcastId: params.podcastId,
  };

  const createEpisode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const photoFile = (
        document.querySelector(
          'input[type="file"][accept="image/*"]'
        ) as HTMLInputElement
      )?.files?.[0];

      const photoURL = photoFile
        ? await uploadFile(
            photoFile,
            `podcasts/${params.podcastId}/episodes/${episodeId}/photo`
          )
        : '';

      const audioFile = (
        document.querySelector(
          'input[type="file"][accept="audio/*"]'
        ) as HTMLInputElement
      )?.files?.[0];

      const audioURL = audioFile
        ? await uploadFile(
            audioFile,
            `podcasts/${params.podcastId}/episodes/${episodeId}/audio`
          )
        : '';

      await addEpisode(
        episodeId,
        params.podcastId,
        title,
        date,
        description,
        longDescription,
        photoURL,
        audioURL,
        spotifyURL,
        applePodcastsURL,
        ytMusicURL
      );

      setPhotoURL('');
      setTitle('');
      setDate('');
      setDescription('');
      setLongDescription('');
      setSpotifyURL('');
      setApplePodcastsURL('');
      setYtMusicURL('');
      setAudioURL('');
      router.push(`/dashboard/podcasts/${params.podcastId}/${episodeId}`);
    } catch (error) {
      console.error('Error creating episode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page__responsive">
      <div className="flex flex-col gap-2">
        <h2 className="page__title">Add episode</h2>
        <h3 className="text-lg font-medium text-defaultBlue-300">
          {podcastData.title}
        </h3>
      </div>
      <div className="flex w-full gap-20  h-[78vh]">
        <div className="flex flex-col gap-6 w-3/5">
          <form
            onSubmit={createEpisode}
            className="flex flex-col h-full items-end gap-4"
          >
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              required
              className="rounded-sm border border-1 p-2 w-full"
            />
            <div className="flex w-full items-center rounded-sm border border-1 p-2">
              <label htmlFor="audio-file" className="text-gray-400 mr-2">
                Photo file
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e, setPhotoURL)}
                required
              />
            </div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="rounded-sm border border-1 p-2 w-full"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              required
              className="rounded-sm border border-1 p-2 w-full h-full resize-none"
            />

            <div className="flex w-full items-center rounded-sm border border-1 p-2">
              <label htmlFor="audio-file" className="text-gray-400 mr-2">
                Audio file
              </label>
              <input
                id="audio-file"
                type="file"
                accept="audio/*"
                onChange={handleAudioFileChange}
                required
              />
            </div>

            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              placeholder="Long Description"
              className="rounded-sm border border-1 p-2 w-full h-full resize-none"
            />
            <input
              type="text"
              value={spotifyURL}
              onChange={(e) => setSpotifyURL(e.target.value)}
              placeholder="Spotify URL"
              className="rounded-sm border border-1 p-2 w-full"
            />
            <input
              type="text"
              value={applePodcastsURL}
              onChange={(e) => setApplePodcastsURL(e.target.value)}
              placeholder="Apple Podcasts URL"
              className="rounded-sm border border-1 p-2 w-full"
            />
            <input
              type="text"
              value={ytMusicURL}
              onChange={(e) => setYtMusicURL(e.target.value)}
              placeholder="Yt Music URL"
              className="rounded-sm border border-1 p-2 w-full"
            />
            <button
              type="submit"
              className="w-40 border border-defaultBlue-300 rounded-sm bg-defaultBlue-300 text-white px-4 py-2 hover:bg-white hover:text-defaultBlue-300 transition-all  "
            >
              {isLoading ? <LoadingComponent height="full" /> : 'Add episode'}
            </button>
          </form>
        </div>
        <div className="flex flex-col gap-6 w-2/5">
          <Episode episodeData={episodeData} creation={true} />
        </div>
      </div>
    </div>
  );
};

export default AddEpisode;
