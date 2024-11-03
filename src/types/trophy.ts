export type Trophy = {
  id: string;
  episodeId: string;
  title: string;
  photo: string;
  description: string;
  level: number;
};

export type UserTrophy = {
  id: string;
  trophyId: string;
  userId: string;
};
