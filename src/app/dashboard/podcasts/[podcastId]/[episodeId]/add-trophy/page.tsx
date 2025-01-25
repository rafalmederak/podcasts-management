'use client';

import TrophyComponent from '@/components/trophy/TrophyQuestionSection';
import TrophyMain from '@/components/trophy/TrophyBody';
import { getEpisode } from '@/services/episodes.service';
import { uploadFile } from '@/utils/photoChange';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import useSWR from 'swr';
import { v4 as uuidv4 } from 'uuid';
import LoadingComponent from '@/components/Loading';
import { auth } from '@/firebase/firebaseConfig';
import { addTrophy } from '@/services/trophies.service';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Trophy } from '@/types/trophy';
import FormInput from '@/components/FormInput';
import Textarea from '@/components/Textarea';
import { trophySchema } from '@/schemas/trophySchema';
import { TrashIcon } from '@heroicons/react/24/solid';

type TrophyFormData = {
  title: string;
  photo?: File;
  description: string;
  level: number;
  task: {
    question: string;
    type: 'radio';
    radioOptions: string[];
  };
  goodAnswerIndex: number;
};

const AddTrophy = () => {
  const { currentUser } = auth;
  const router = useRouter();
  const params = useParams<{ podcastId: string; episodeId: string }>();
  const { data: episodeData } = useSWR(`${params.episodeId}`, () =>
    getEpisode(params.episodeId)
  );

  const trophyId = uuidv4();
  const [photoURL, setPhotoURL] = useState<string>('');
  const [goodAnswerIndex, setGoodAnswerIndex] = useState<number | null>(0);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    resolver: yupResolver(trophySchema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      photo: undefined,
      description: '',
      level: 1,
      task: {
        question: '',
        type: 'radio',
        radioOptions: [''],
      },
      goodAnswerIndex: 0,
    },
  });

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    setValue,
  } = methods;

  const createTrophy = async (data: TrophyFormData) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const photoFile = data.photo;
      const photoURL = photoFile
        ? await uploadFile(
            photoFile,
            `podcasts/${params.podcastId}/episodes/${params.episodeId}/trophies/${trophyId}/photo`
          )
        : '';

      const task = {
        question: data.task.question,
        type: 'radio',
        radioOptions: data.task.radioOptions,
      };

      await addTrophy({
        id: trophyId,
        episodeId: params.episodeId,
        title: data.title,
        photo: photoURL,
        description: data.description,
        level: data.level,
        task,
        goodAnswerIndex: data.goodAnswerIndex,
      });

      setPhotoURL('');
      methods.reset();
      router.push(
        `/dashboard/podcasts/${params.podcastId}/${params.episodeId}`
      );
    } catch (error) {
      console.error('Error creating trophy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOption = () => {
    const options = methods.getValues('task.radioOptions');
    if (options) {
      setValue('task.radioOptions', [...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    const options = methods.getValues('task.radioOptions');
    if (options) {
      const updatedOptions = options.filter((_, i) => i !== index);

      if (updatedOptions.length === 0) {
        updatedOptions.push('');
      }

      setValue('task.radioOptions', updatedOptions);

      if (goodAnswerIndex === index) {
        setGoodAnswerIndex(0);
      } else if (goodAnswerIndex !== null && goodAnswerIndex > index) {
        setGoodAnswerIndex(goodAnswerIndex - 1);
      }
    }
  };

  const handleSetGoodAnswer = (index: number) => {
    setGoodAnswerIndex(index);
    setValue('goodAnswerIndex', index);
  };

  const trophy: Trophy = {
    id: trophyId,
    episodeId: params.episodeId,
    title: methods.watch('title'),
    photo: photoURL,
    description: methods.watch('description'),
    level: methods.watch('level'),
    task: {
      type: 'radio',
      question: methods.watch('task.question'),
      radioOptions: methods.watch('task.radioOptions'),
    },
  };

  return (
    <div className="page__responsive">
      <div className="flex flex-col gap-2">
        <h2 className="page__title">Add trophy</h2>
        <h3 className="text-lg font-medium text-defaultBlue-300">
          {episodeData?.title}
        </h3>
      </div>
      <div className="flex gap-20">
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(createTrophy)}
            className="flex flex-col w-2/3 gap-4"
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
                    <label htmlFor="photo-file" className="text-gray-400 mr-2">
                      Photo file
                    </label>
                    <input
                      id="photo-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files ? e.target.files[0] : null;
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
              name="level"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormInput
                  {...field}
                  type="number"
                  placeholder="Level"
                  min="1"
                  max="3"
                  step="1"
                  onChange={(e) => {
                    const newValue = Math.max(
                      1,
                      Math.min(3, Number(e.target.value))
                    );
                    field.onChange(newValue);
                  }}
                  value={field.value}
                  errorMessage={error?.message}
                />
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

            <span className="bg-gray-200 w-full h-[3px]"></span>
            <Controller
              name="task.question"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <FormInput
                  {...field}
                  type="text"
                  placeholder="Task Question"
                  className="rounded-sm border border-1 p-2 w-full"
                  errorMessage={error?.message}
                />
              )}
            />
            <div className="flex gap-4">
              <Controller
                name="task.radioOptions"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <div className="w-full flex flex-col gap-4">
                    {field.value?.map((option, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-4 w-full"
                      >
                        <FormInput
                          {...field}
                          type="text"
                          value={option}
                          placeholder="Enter an option"
                          onChange={(e) => {
                            const updatedOptions = [...field.value];
                            updatedOptions[index] = e.target.value;
                            field.onChange(updatedOptions);
                          }}
                          className="rounded-sm border border-1 p-2 w-full"
                          errorMessage={error?.message}
                        />
                        {field.value.length > 1 && (
                          <div className="flex gap-2 items-start h-full">
                            <button
                              type="button"
                              onClick={() => handleSetGoodAnswer(index)}
                              className={`${
                                goodAnswerIndex === index
                                  ? 'bg-green-500 text-white'
                                  : 'bg-white'
                              } rounded-sm border border-1 p-2 w-60`}
                            >
                              {goodAnswerIndex === index
                                ? 'Good Answer'
                                : 'Set Good Answer'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index)}
                              className="bg-red-500 flex items-center justify-center rounded-sm border border-1 p-2 w-12 text-white"
                            >
                              <TrashIcon className="w-4 h-6" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="min-w-40 rounded-sm border border-1 p-2 cursor-pointer"
                    >
                      Add Option
                    </button>
                  </div>
                )}
              />
            </div>

            <div className="flex justify-between mt-4">
              <button
                type="submit"
                className="w-40 border border-defaultBlue-300 rounded-sm bg-defaultBlue-300 text-white px-4 py-2 hover:bg-white hover:text-defaultBlue-300 transition-all  "
                disabled={isSubmitting || isLoading}
              >
                {isLoading ? (
                  <LoadingComponent height="full" />
                ) : (
                  'Create Trophy'
                )}
              </button>
            </div>
          </form>
        </FormProvider>
        <div className="flex flex-col w-1/3 gap-4">
          <TrophyMain creation={true} trophy={trophy} />
          <TrophyComponent creation={true} trophy={trophy} />
        </div>
      </div>
    </div>
  );
};

export default AddTrophy;
