import { Timestamp } from 'firebase/firestore';

export type Trophy = {
  id: string;
  episodeId: string;
  title: string;
  photo: string;
  description: string;
  level: number;
  task: {
    question: string;
    type: string;
    radioOptions: string[];
  };
  goodAnswerIndex?: number;
};

export type UserTrophy = {
  id: string;
  trophyId: string;
  userId: string;
  answer?: number;
  timestamp: Timestamp;
};
