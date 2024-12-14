import { User } from 'firebase/auth';

export type UserRecord = {
  uid: string;
  displayName?: string;
  createdAt: string;
};

export type UserRanking = {
  trophiesCount: number;
  rank: number;
} & Pick<User, 'uid'> & {
    displayName?: string | null;
    photoURL?: string | null;
  };
