'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import Episode from '@/components/Episode';
import { getPodcast } from '@/services/podcasts.service';
import { EpisodeType } from '@/types/episode';
import { auth } from '@/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { getEpisode, updateEpisode } from '@/services/episodes.service';
import LoadingComponent from '@/components/Loading';
import { uploadFile } from '@/utils/photoChange';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Textarea from '@/components/Textarea';
import FormInput from '@/components/FormInput';
import Image from 'next/image';
import { editEpisodeSchema } from '@/schemas/editEpisodeSchema';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';

const EditEpisodeMiddleware = () => {
  const params = useParams<{
    episodeId: string;
  }>();

  const {
    data: episodeData,
    isLoading: episodeLoading,
    mutate,
  } = useSWR(`${params.episodeId}`, () => getEpisode(params.episodeId));
  if (episodeLoading) return <LoadingComponent />;

  if (!episodeData) return null;

  return <EditEpisode episodeData={episodeData} />;
};

const EditEpisode = ({ episodeData }: { episodeData: EpisodeType }) => {
  const { currentUser } = auth;
  const router = useRouter();

  const [photoURL, setPhotoURL] = useState<string>(episodeData.photo);
  const [audioURL, setAudioURL] = useState<string | ArrayBuffer | null>(
    episodeData.audioURL
  );
  const [keepExistingPhoto, setKeepExistingPhoto] = useState(true);
  const [keepExistingAudio, setKeepExistingAudio] = useState(true);
  const params = useParams<{ podcastId: string; episodeId: string }>();

  const [isLoading, setIsLoading] = useState(false);

  type FormInputs = {
    title: string;
    photo?: File;
    audio?: File;
    description: string;
    date: string;
    longDescription: string;
    spotifyURL?: string;
    applePodcastsURL?: string;
    ytMusicURL?: string;
  };

  const methods = useForm({
    resolver: yupResolver(editEpisodeSchema),
    mode: 'onBlur',
    defaultValues: {
      title: episodeData?.title,
      photo: undefined,
      audio: undefined,
      description: episodeData.description,
      date: episodeData.date,
      longDescription: episodeData.longDescription,
      spotifyURL: episodeData.spotifyURL,
      applePodcastsURL: episodeData.applePodcastsURL,
      ytMusicURL: episodeData.ytMusicURL,
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const editEpisode = async (data: FormInputs) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const photoFile = data.photo;

      const uploadedPhotoURL =
        photoFile && !keepExistingPhoto
          ? await uploadFile(
              photoFile,
              `podcasts/${params.podcastId}/episodes/${params.episodeId}/photo`
            )
          : photoURL;

      const audioFile = data.audio;

      const uploadedAudioURL =
        audioFile && !keepExistingAudio
          ? await uploadFile(
              audioFile,
              `podcasts/${params.podcastId}/episodes/${params.episodeId}/audio`
            )
          : audioURL;

      await updateEpisode({
        id: params.episodeId,
        podcastId: params.podcastId,
        title: data.title,
        date: data.date,
        description: data.description,
        longDescription: data.longDescription,
        photo: uploadedPhotoURL,
        audioURL: uploadedAudioURL,
        spotifyURL: data.spotifyURL,
        applePodcastsURL: data.applePodcastsURL,
        ytMusicURL: data.ytMusicURL,
      });
      mutate(`${params.episodeId}`);
      setPhotoURL('');

      setAudioURL('');
      methods.reset();
      router.push(
        `/dashboard/podcasts/${params.podcastId}/${params.episodeId}`
      );
    } catch (error) {
      console.error('Error creating episode:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const episode: EpisodeType = {
    title: methods.watch('title'),
    date: methods.watch('date'),
    description: methods.watch('description'),
    longDescription: methods.watch('longDescription'),
    spotifyURL: methods.watch('spotifyURL'),
    applePodcastsURL: methods.watch('applePodcastsURL'),
    ytMusicURL: methods.watch('ytMusicURL'),
    photo: photoURL,
    audioURL: audioURL,
    id: params.episodeId,
    podcastId: params.podcastId,
  };

  return (
    <div className="page__responsive">
      <div className="flex flex-col gap-2">
        <h2 className="page__title">Edit episode</h2>
        <h3 className="text-lg font-medium text-defaultBlue-300">
          {episodeData.title}
        </h3>
      </div>
      <div className="flex flex-col 2xl:flex-row w-full gap-10 2xl:gap-20 2xl:h-[78vh]">
        <div className="flex flex-col gap-6 w-full 2xl:w-3/5">
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(editEpisode)}
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
              <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center gap-4 w-full">
                <div className="flex hover:scale-105 transition-all w-full md:w-60">
                  <div className="w-1/2 lg:w-12 h-12 relative">
                    <Image
                      src={episodeData.photo}
                      alt="Trophy"
                      fill={true}
                      className="rounded-l-md shadow-md object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setKeepExistingPhoto(true);
                      setPhotoURL(episodeData.photo);
                    }}
                    className={`${
                      keepExistingPhoto
                        ? 'bg-defaultBlue-300 text-white'
                        : 'bg-white border'
                    }  w-full 2xl:w-32 text-md  rounded-r-md `}
                  >
                    Keep existing
                  </button>
                </div>
                <p className="text-md font-medium">OR</p>

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
                          className={`${
                            !keepExistingPhoto &&
                            'bg-defaultBlue-300 text-white font-normal border-none rounded-md'
                          }`}
                          onChange={(e) => {
                            const file = e.target.files
                              ? e.target.files[0]
                              : null;
                            if (file) {
                              setPhotoURL(URL.createObjectURL(file));
                              setKeepExistingPhoto(false);
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
              </div>
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

              <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center gap-4 w-full">
                <div className="flex hover:scale-105 transition-all w-full md:w-60">
                  <div className="w-1/2 lg:w-12 h-12 flex items-center justify-center border rounded-l-md">
                    <SpeakerWaveIcon className="w-6 h-6" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setKeepExistingAudio(true);
                      setAudioURL(episodeData.audioURL);
                    }}
                    className={`${
                      keepExistingAudio
                        ? 'bg-defaultBlue-300 text-white'
                        : 'bg-white border'
                    }  w-full 2xl:w-32 text-md  rounded-r-md `}
                  >
                    Keep existing
                  </button>
                </div>
                <p className="text-md font-medium">OR</p>
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
                          className={`${
                            !keepExistingAudio &&
                            'bg-defaultBlue-300 text-white font-normal border-none rounded-md'
                          }`}
                          onChange={(e) => {
                            const file = e.target.files
                              ? e.target.files[0]
                              : null;
                            if (file) {
                              setKeepExistingAudio(false);
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
              </div>
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
                {isLoading ? (
                  <LoadingComponent height="full" />
                ) : (
                  'Edit episode'
                )}
              </button>
            </form>
          </FormProvider>
        </div>
        <div className="flex flex-col gap-6 w-full 2xl:w-2/5">
          <Episode episodeData={episode} creation={true} />
        </div>
      </div>
    </div>
  );
};

export default EditEpisodeMiddleware;
