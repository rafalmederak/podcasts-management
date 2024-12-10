export type Episode = {
  id: string;
  podcastId: string;
  title: string;
  date: string;
  description: string;
  longDescription: string;
  photo: string;
  audioURL: string;
  spotifyURL?: string;
  applePodcastsURL?: string;
  ytMusicURL?: string;
};
