'use client';

import React, { useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/firebaseConfig';
import { addPodcast } from '@/services/podcasts.service';
import { uploadFile } from '@/utils/photoChange';
import { v4 as uuidv4 } from 'uuid';
import LoadingComponent from '@/components/Loading';
import Podcast from '@/components/Podcast';
import { podcastSchema } from '@/schemas/podcastSchema';
import FormInput from '@/components/FormInput';
import Textarea from '@/components/Textarea';

type FormInputs = {
  title: string;
  photo: File;
  description: string;
  host: string;
};

const CreatePodcast = () => {
  const { currentUser } = auth;
  const router = useRouter();
  const [photoURL, setPhotoURL] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    resolver: yupResolver(podcastSchema),
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = methods;

  const createPodcast = async (data: FormInputs) => {
    if (currentUser) {
      setIsLoading(true);
      try {
        const podcastId = uuidv4();
        const photoFile = data.photo;

        const photoURL = photoFile
          ? await uploadFile(photoFile, `podcasts/${podcastId}/photo`)
          : '';

        await addPodcast(
          podcastId,
          currentUser.uid,
          photoURL,
          data.title,
          data.host,
          data.description
        );

        setPhotoURL('');
        methods.reset();
        router.push(`/dashboard/podcasts/${podcastId}`);
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
      <div className="flex w-full gap-20 h-[78vh]">
        <div className="flex flex-col gap-6 w-3/5">
          <h3 className="text-lg font-medium">Podcast</h3>
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(createPodcast)}
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
              <Controller
                name="photo"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div className="flex flex-col w-full">
                    <div className="flex w-full items-center rounded-sm border border-1 p-2">
                      <label
                        htmlFor="audio-file"
                        className="text-gray-400 mr-2"
                      >
                        Photo file
                      </label>
                      <input
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
                  'Create podcast'
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

export default CreatePodcast;
