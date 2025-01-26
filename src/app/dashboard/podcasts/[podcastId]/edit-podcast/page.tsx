'use client';

import React, { useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useParams, useRouter } from 'next/navigation';
import { auth } from '@/firebase/firebaseConfig';
import { getPodcast, updatePodcast } from '@/services/podcasts.service';
import { uploadFile } from '@/utils/photoChange';
import LoadingComponent from '@/components/Loading';
import Podcast from '@/components/Podcast';
import FormInput from '@/components/FormInput';
import Textarea from '@/components/Textarea';
import useSWR, { mutate } from 'swr';
import { Podcast as PodcastType } from '@/types/podcast';
import Image from 'next/image';
import { editPodcastSchema } from '@/schemas/editPodcastSchema';

type FormInputs = {
  title: string;
  photo?: File;
  description: string;
  host: string;
};

const EditPodcastMiddleware = () => {
  const params = useParams<{
    podcastId: string;
  }>();

  const {
    data: podcastData,
    isLoading: podcastLoading,
    mutate,
  } = useSWR(`${params.podcastId}`, () => getPodcast(params.podcastId));
  if (podcastLoading) return <LoadingComponent />;

  if (!podcastData) return null;

  return <EditPodcast podcastData={podcastData} />;
};

const EditPodcast = ({ podcastData }: { podcastData: PodcastType }) => {
  const { currentUser } = auth;
  const router = useRouter();
  const params = useParams<{
    podcastId: string;
  }>();
  const [photoURL, setPhotoURL] = useState<string>(podcastData.photo);
  const [isLoading, setIsLoading] = useState(false);
  const [keepExistingPhoto, setKeepExistingPhoto] = useState(true);

  const methods = useForm({
    resolver: yupResolver(editPodcastSchema),
    mode: 'onBlur',
    defaultValues: {
      title: podcastData.title,
      photo: undefined,
      description: podcastData.description,
      host: podcastData.host,
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const editPodcast = async (data: FormInputs) => {
    if (currentUser) {
      setIsLoading(true);
      try {
        const photoFile = data.photo;

        const uploadedPhotoURL =
          photoFile && !keepExistingPhoto
            ? await uploadFile(photoFile, `podcasts/${params.podcastId}/photo`)
            : photoURL;

        await updatePodcast({
          id: params.podcastId,
          userId: currentUser.uid,
          photo: uploadedPhotoURL,
          title: data.title,
          host: data.host,
          description: data.description,
        });
        mutate(`${params.podcastId}`);
        setPhotoURL('');
        methods.reset();
        router.push(`/dashboard/podcasts/${params.podcastId}`);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="page__responsive">
      <h2 className="page__title">Edit Podcast</h2>
      <div className="flex w-full gap-20 h-[78vh]">
        <div className="flex flex-col gap-6 w-3/5">
          <h3 className="text-lg font-medium">{podcastData.title}</h3>
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(editPodcast)}
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
                name="host"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormInput
                    {...field}
                    type="text"
                    placeholder="Host"
                    errorMessage={error?.message}
                  />
                )}
              />
              <div className="flex items-center gap-4 w-full">
                <div className="flex hover:scale-105 transition-all">
                  <div className="w-12 h-12 relative">
                    <Image
                      src={podcastData.photo}
                      alt="Podcast"
                      fill={true}
                      className="rounded-l-md shadow-md object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setKeepExistingPhoto(true);
                      setPhotoURL(podcastData.photo);
                    }}
                    className={`${
                      keepExistingPhoto
                        ? 'bg-defaultBlue-300 text-white'
                        : 'bg-white border'
                    }  w-32 text-md  rounded-r-md `}
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
              <button
                type="submit"
                className="w-40 border border-defaultBlue-300 rounded-sm bg-defaultBlue-300 text-white px-4 py-2 hover:bg-white hover:text-defaultBlue-300 transition-all"
              >
                {isLoading ? (
                  <LoadingComponent height="full" />
                ) : (
                  'Edit podcast'
                )}
              </button>
            </form>
          </FormProvider>
        </div>
        <div className="flex flex-col gap-6 w-2/5">
          <div className="flex flex-col gap-3">
            <h1 className="page__title">
              {methods.watch('title') ? (
                <p>{methods.watch('title')}</p>
              ) : (
                <i>Podcast title</i>
              )}
            </h1>
            <h2 className="text-md">
              {methods.watch('host') ? (
                <p>{methods.watch('host')}</p>
              ) : (
                <i>Podcast host</i>
              )}
            </h2>
          </div>
          <Podcast
            photo={photoURL}
            description={methods.watch('description')}
            creation={true}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPodcastMiddleware;
