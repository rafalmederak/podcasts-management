import { Trophy } from '@/types/trophy';
import React from 'react';

type TrophyQuestionSectionProps = {
  creation?: boolean;
  trophy: Trophy;
  selectedAnswer?: any;
  userTrophy?: any;
  handleRadioChange?: any;
  isBlocked?: boolean;
  isUserTrophy?: (itemId: Trophy['id']) => boolean | null;
};

const TrophyQuestionSection = ({
  creation,
  trophy,
  selectedAnswer,
  userTrophy,
  handleRadioChange,
  isBlocked,
  isUserTrophy,
}: TrophyQuestionSectionProps) => {
  return (
    <div key={trophy.id} className="flex flex-col gap-6">
      <div>
        {trophy.task.question ? trophy.task.question : <i>Task Question</i>}
      </div>
      {trophy.task.type && trophy.task.type === 'radio' && (
        <div className="flex gap-5 flex-wrap">
          {trophy.task.radioOptions?.map((option, index) => (
            <label
              key={index}
              className={`${
                selectedAnswer === index || userTrophy?.answer == index
                  ? 'bg-blue-400'
                  : 'bg-blue-200'
              } min-w-32  py-2 px-4 min-h-8 flex items-center justify-center rounded-sm transition-all ${
                !creation &&
                selectedAnswer >= 0 &&
                !isBlocked &&
                !isUserTrophy?.(trophy.id)
                  ? 'hover:bg-blue-400 cursor-pointer '
                  : ''
              }`}
            >
              <input
                disabled={
                  creation ||
                  selectedAnswer < 0 ||
                  isBlocked ||
                  isUserTrophy?.(trophy.id) === true
                }
                type="radio"
                className="hidden"
                name={`input-${index}`}
                value={option}
                onChange={() => handleRadioChange(index)}
                checked={selectedAnswer === index}
                required
              />
              {option}
            </label>
          ))}
        </div>
      )}
      <span className="bg-gray-200 w-full h-[3px]"></span>
    </div>
  );
};

export default TrophyQuestionSection;
