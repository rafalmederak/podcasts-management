'use client';

import TrophyComponent from '@/components/trophy/TrophyQuestionSection';
import TrophyMain from '@/components/trophy/TrophyBody';
import { getEpisode } from '@/services/episodes.service';
import { handlePhotoChange, uploadFile } from '@/utils/photoChange';
import { useParams, useRouter } from 'next/navigation';
import React, { FormEvent, useState } from 'react';
import useSWR from 'swr';
import { v4 as uuidv4 } from 'uuid';
import LoadingComponent from '@/components/Loading';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { auth } from '@/firebase/firebaseConfig';
import { addTrophy } from '@/services/trophies.service';

const AddTrophy = () => {
  const { currentUser } = auth;
  const router = useRouter();

  const params = useParams<{ podcastId: string; episodeId: string }>();

  const [photoURL, setPhotoURL] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState(1);
  const [taskQuestion, setTaskQuestion] = useState('');
  const [taskRadioOptions, setTaskRadioOptions] = useState<string[]>([]);
  const [goodAnswerIndex, setGoodAnswerIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { data: episodeData } = useSWR(`${params.episodeId}`, () =>
    getEpisode(params.episodeId)
  );

  const trophyId = uuidv4();

  const trophy = {
    id: trophyId,
    episodeId: params.episodeId,
    title,
    photo: photoURL,
    description,
    level,
    task: {
      type: 'radio',
      question: taskQuestion,
      radioOptions: taskRadioOptions,
    },
  };

  //functions
  const handleAddOption = () => {
    if (inputValue.trim() === '') {
      setError('Option cannot be empty.');
      return;
    }
    setTaskRadioOptions([...taskRadioOptions, inputValue.trim()]);
    setInputValue('');
    setError(null);
  };

  const handleRemoveOption = (index: number) => {
    setTaskRadioOptions(taskRadioOptions.filter((_, i) => i !== index));
    if (goodAnswerIndex === index) {
      setGoodAnswerIndex(null);
    } else if (goodAnswerIndex !== null && goodAnswerIndex > index) {
      setGoodAnswerIndex(goodAnswerIndex - 1);
    }
  };

  const handleSetGoodAnswer = (index: number) => {
    setGoodAnswerIndex(index);
  };

  const createTrophy = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (taskRadioOptions.length < 2) {
      setError('You must add at least two options.');
      return;
    }
    if (goodAnswerIndex === null) {
      setError('You must select a good answer.');
      return;
    }
    setError(null);

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
            `podcasts/${params.podcastId}/episodes/${params.episodeId}/trophies/${trophyId}/photo`
          )
        : '';

      const task = {
        question: taskQuestion,
        type: 'radio',
        radioOptions: taskRadioOptions,
      };

      await addTrophy({
        id: trophyId,
        episodeId: params.episodeId,
        title,
        photo: photoURL,
        description,
        level,
        task,
        goodAnswerIndex,
      });

      setPhotoURL('');
      setTitle('');
      setDescription('');
      setLevel(1);
      setTaskQuestion('');
      setTaskRadioOptions([]);
      setGoodAnswerIndex(null);
      router.push(
        `/dashboard/podcasts/${params.podcastId}/${params.episodeId}`
      );
    } catch (error) {
      console.error('Error creating trophy:', error);
    } finally {
      setIsLoading(false);
    }
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
        <form onSubmit={createTrophy} className="flex flex-col w-2/3 gap-4">
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
            type="number"
            min={1}
            max={3}
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            placeholder="Level"
            required
            className="rounded-sm border border-1 p-2 w-full h-10 resize-none"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            required
            className="rounded-sm border border-1 p-2 w-full h-full resize-none"
          />

          <span className="bg-gray-200 w-full h-[3px]"></span>
          <input
            type="text"
            value={taskQuestion}
            onChange={(e) => setTaskQuestion(e.target.value)}
            placeholder="Task Question"
            required
            className="rounded-sm border border-1 p-2 w-full"
          />
          <div className="flex gap-4">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter an option"
              className="rounded-sm border border-1 p-2 w-full"
            />
            <input
              value={'Add option'}
              type="button"
              onClick={handleAddOption}
              className="min-w-40 rounded-sm border border-1 p-2 cursor-pointer"
            />
          </div>
          <button
            type="submit"
            className="w-40 border border-defaultBlue-300 rounded-sm bg-defaultBlue-300 text-white px-4 py-2 hover:bg-white hover:text-defaultBlue-300 transition-all  "
          >
            {isLoading ? <LoadingComponent height="full" /> : 'Add trophy'}
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </form>
        <div className="flex flex-col w-1/3 gap-4">
          <TrophyMain creation={true} trophy={trophy} />
          <TrophyComponent creation={true} trophy={trophy} />

          <ul className="flex flex-col gap-4">
            {taskRadioOptions.map((option, index) => (
              <li key={index} className="flex items-center">
                <span className="w-full">{option}</span>{' '}
                <div className="flex w-full  gap-4 justify-end">
                  <label className="bg-green-300 py-1  px-2 rounded-sm  min-w-40">
                    <input
                      type="checkbox"
                      checked={goodAnswerIndex === index}
                      required
                      onChange={() => handleSetGoodAnswer(index)}
                    />{' '}
                    Good Answer
                  </label>
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="bg-red-400 py-1 px-2 w-24 rounded-sm text-white"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddTrophy;
