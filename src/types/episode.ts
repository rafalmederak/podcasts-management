export type EpisodeType = {
  id: string;
  podcastId: string;
  title: string;
  date: string;
  description: string;
  longDescription: string;
  photo: string;
  audioURL: string | ArrayBuffer | null;
  spotifyURL?: string;
  applePodcastsURL?: string;
  ytMusicURL?: string;
};
