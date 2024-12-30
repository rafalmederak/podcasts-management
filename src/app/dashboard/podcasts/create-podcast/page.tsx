'use client';

import Podcast from '@/components/Podcast';
import { auth } from '@/firebase/firebaseConfig';
import { addPodcast } from '@/services/podcasts.service';
import { useRouter } from 'next/navigation';
import React, { FormEvent, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const CreatePodcast = () => {
  const { currentUser } = auth;
  const router = useRouter();
  const [photo, setPhoto] = useState('');
  const [title, setTitle] = useState('');
  const [host, setHost] = useState('');
  const [description, setDescription] = useState('');

  const createPodcast = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentUser) {
      try {
        const podcastId = uuidv4();
        await addPodcast(
          podcastId,
          currentUser.uid,
          photo,
          title,
          host,
          description
        );
        setPhoto('');
        setTitle('');
        setHost('');
        setDescription('');
        return router.push(`/dashboard/podcasts/${podcastId}`);
      } catch (error) {
        console.error(error);
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
            <input
              type="text"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
              placeholder="Photo URL"
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
            <button
              type="submit"
              className="border border-defaultBlue-300 rounded-sm bg-defaultBlue-300 text-white px-4 py-2 hover:bg-white hover:text-defaultBlue-300 transition-all  "
            >
              Create podcast
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
          <Podcast photo={photo} description={description} creation={true} />
        </div>
      </div>
    </div>
  );
};

export default CreatePodcast;
