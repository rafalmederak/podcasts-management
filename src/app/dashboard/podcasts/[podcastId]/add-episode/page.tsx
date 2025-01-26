'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import Episode from '@/components/Episode';
import { getPodcast } from '@/services/podcasts.service';
import { v4 as uuidv4 } from 'uuid';
import { EpisodeType } from '@/types/episode';
import { auth } from '@/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { addEpisode } from '@/services/episodes.service';
import LoadingComponent from '@/components/Loading';
import { uploadFile } from '@/utils/photoChange';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { episodeSchema } from '@/schemas/episodeSchema';
import Textarea from '@/components/Textarea';
import FormInput from '@/components/FormInput';

const AddEpisode = () => {
  const { currentUser } = auth;
  const router = useRouter();

  const [photoURL, setPhotoURL] = useState<string>('');
  const [audioURL, setAudioURL] = useState<string | ArrayBuffer | null>('');
  const params = useParams<{ podcastId: string }>();
  const episodeId = uuidv4();

  const [isLoading, setIsLoading] = useState(false);

  const { data: podcastData } = useSWR(`${params.podcastId}`, getPodcast, {
    suspense: true,
  });

  type FormInputs = {
    title: string;
    photo: File;
    audio: File;
    description: string;
    date: string;
    longDescription: string;
    spotifyURL?: string;
    applePodcastsURL?: string;
    ytMusicURL?: string;
  };

  const createEpisode = async (data: FormInputs) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const photoFile = data.photo;

      const photoURL = photoFile
        ? await uploadFile(
            photoFile,
            `podcasts/${params.podcastId}/episodes/${episodeId}/photo`
          )
        : '';

      const audioFile = data.audio;

      const audioURL = audioFile
        ? await uploadFile(
            audioFile,
            `podcasts/${params.podcastId}/episodes/${episodeId}/audio`
          )
        : '';

      await addEpisode(
        episodeId,
        params.podcastId,
        data.title,
        data.date,
        data.description,
        data.longDescription,
        photoURL,
        audioURL,
        data.spotifyURL,
        data.applePodcastsURL,
        data.ytMusicURL
      );

      setPhotoURL('');

      setAudioURL('');
      methods.reset();
      router.push(`/dashboard/podcasts/${params.podcastId}/${episodeId}`);
    } catch (error) {
      console.error('Error creating episode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const methods = useForm({
    resolver: yupResolver(episodeSchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      photo: undefined,
      audio: undefined,
      description: '',
      date: '',
      longDescription: '',
      spotifyURL: '',
      applePodcastsURL: '',
      ytMusicURL: '',
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const episodeData: EpisodeType = {
    title: methods.watch('title'),
    date: methods.watch('date'),
    description: methods.watch('description'),
    longDescription: methods.watch('longDescription'),
    spotifyURL: methods.watch('spotifyURL'),
    applePodcastsURL: methods.watch('applePodcastsURL'),
    ytMusicURL: methods.watch('ytMusicURL'),
    photo: photoURL,
    audioURL: audioURL,
    id: episodeId,
    podcastId: params.podcastId,
  };

  return (
    <div className="page__responsive">
      <div className="flex flex-col gap-2">
        <h2 className="page__title">Add episode</h2>
        <h3 className="text-lg font-medium text-defaultBlue-300">
          {podcastData.title}
        </h3>
      </div>
      <div className="flex flex-col 2xl:flex-row w-full gap-10 2xl:gap-20 2xl:h-[78vh]">
        <div className="flex flex-col gap-6 w-full 2xl:w-3/5">
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(createEpisode)}
              className="flex flex-col h-full items-end gap-4"
            >
              <Controller
                name="title"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormInput
                    {...field}
                    type="text"
                    placeholder="Title"
                    errorMessage={error?.message}
                  />
                )}
              />
              <Controller
                name="photo"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col w-full">
                    <div className="flex w-full items-center rounded-sm border border-1 p-2">
                      <label
                        htmlFor="photo-file"
                        className="text-gray-400 mr-2"
                      >
                        Photo file
                      </label>
                      <input
                        id="photo-file"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files
                            ? e.target.files[0]
                            : null;
                          if (file) {
                            setPhotoURL(URL.createObjectURL(file));
                            field.onChange(file);
                          }
                        }}
                      />
                    </div>
                    {error && (
                      <p className="text-red-500 text-sm font-medium my-1.5">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />
              <Controller
                name="date"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col w-full">
                    <input
                      {...field}
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      className="rounded-sm border border-1 p-2 w-full"
                    />
                    {error && (
                      <p className="text-red-500 text-sm font-medium my-1.5">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Textarea
                    {...field}
                    placeholder="Description"
                    errorMessage={error?.message}
                  />
                )}
              />

              <Controller
                name="audio"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col w-full">
                    <div className="flex w-full items-center rounded-sm border border-1 p-2">
                      <label
                        htmlFor="audio-file"
                        className="text-gray-400 mr-2"
                      >
                        Audio file
                      </label>
                      <input
                        id="audio-file"
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files
                            ? e.target.files[0]
                            : null;
                          if (file) {
                            field.onChange(file);
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setAudioURL(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                    {error && (
                      <p className="text-red-500 text-sm font-medium my-1.5">
                        {error.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                name="longDescription"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <Textarea
                    {...field}
                    placeholder="Long Description"
                    errorMessage={error?.message}
                  />
                )}
              />

              <Controller
                name="spotifyURL"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormInput
                    {...field}
                    type="text"
                    placeholder="Spotify URL"
                    errorMessage={error?.message}
                  />
                )}
              />
              <Controller
                name="applePodcastsURL"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormInput
                    {...field}
                    type="text"
                    placeholder="Apple Podcasts URL"
                    errorMessage={error?.message}
                  />
                )}
              />
              <Controller
                name="ytMusicURL"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormInput
                    {...field}
                    type="text"
                    placeholder="YouTube Music URL"
                    errorMessage={error?.message}
                  />
                )}
              />
              <button
                type="submit"
                className="w-40 border border-defaultBlue-300 rounded-sm bg-defaultBlue-300 text-white px-4 py-2 hover:bg-white hover:text-defaultBlue-300 transition-all  "
              >
                {isLoading ? <LoadingComponent height="full" /> : 'Add episode'}
              </button>
            </form>
          </FormProvider>
        </div>
        <div className="flex flex-col gap-6 2xl:w-2/5">
          <Episode episodeData={episodeData} creation={true} />
        </div>
      </div>
    </div>
  );
};

export default AddEpisode;
