'use client';

import LoadingComponent from '@/components/Loading';
import Podcast from '@/components/Podcast';
import { auth } from '@/firebase/firebaseConfig';
import { addPodcast } from '@/services/podcasts.service';
import { handlePhotoChange, uploadFile } from '@/utils/photoChange';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CreatePodcast = () => {
  const { currentUser } = auth;
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [host, setHost] = useState('');
  const [description, setDescription] = useState('');
  const [photoURL, setPhotoURL] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const createPodcast = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentUser) {
      setIsLoading(true);
      try {
        const podcastId = uuidv4();
        const photoFile = (
          document.querySelector(
            'input[type="file"][accept="image/*"]'
          ) as HTMLInputElement
        )?.files?.[0];

        const photoURL = photoFile
          ? await uploadFile(photoFile, `podcasts/${podcastId}/photo`)
          : '';
        await addPodcast(
          podcastId,
          currentUser.uid,
          photoURL,
          title,
          host,
          description
        );

        setPhotoURL('');
        setTitle('');
        setHost('');
        setDescription('');
        return router.push(`/dashboard/podcasts/${podcastId}`);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="page__responsive">
      <h2 className="page__title">Create Podcast</h2>
      <div className="flex w-full gap-20  h-[78vh]">
        <div className="flex flex-col gap-6 w-3/5">
          <h3 className="text-lg font-medium">Podcast</h3>
          <form
            onSubmit={createPodcast}
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
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="Host"
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
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              required
              className="rounded-sm border border-1 p-2 w-full h-full resize-none"
            />
            <button
              type="submit"
              className="w-40 border border-defaultBlue-300 rounded-sm bg-defaultBlue-300 text-white px-4 py-2 hover:bg-white hover:text-defaultBlue-300 transition-all  "
            >
              {isLoading ? (
                <LoadingComponent height="full" />
              ) : (
                'Create podcast'
              )}
            </button>
          </form>
        </div>
        <div className="flex flex-col gap-6 w-2/5">
          <div className="flex flex-col gap-3">
            <h1 className="page__title">
              {title ? <p>{title}</p> : <i>Podcast title</i>}
            </h1>
            <h2 className="text-md">
              {host ? <p>{host}</p> : <i>Podcast host</i>}
            </h2>
          </div>
          <Podcast photo={photoURL} description={description} creation={true} />
        </div>
      </div>
    </div>
  );
};

export default CreatePodcast;
