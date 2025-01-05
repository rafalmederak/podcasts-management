import { db } from '@/firebase/firebaseConfig';
import { EpisodeType } from '@/types/episode';
import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { getPodcast } from './podcasts.service';

export async function getPodcastEpisodes(podcastId: string) {
  const q = query(
    collection(db, 'episodes'),
    where('podcastId', '==', podcastId)
  );

  const querySnapshot = await getDocs(q);

  const episodes = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as EpisodeType[];

  episodes.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return episodes;
}

export async function getEpisode(episodeId: EpisodeType['id']) {
  const episodeRef = doc(db, 'episodes', episodeId);
  const episodeData = await getDoc(episodeRef);

  if (episodeData.exists()) {
    return { id: episodeData.id, ...episodeData.data() } as EpisodeType;
  } else {
    throw new Error(`Episode with id ${episodeId} not found`);
  }
}

export async function addLikeToEpisode(
  episodeId: EpisodeType['id'],
  userId: User['uid']
) {
  const likeId = `${userId}_${episodeId}`;
  const likeRef = doc(db, 'episodeLikes', likeId);

  await setDoc(likeRef, {
    episodeId,
    userId,
    createdAt: Timestamp.now(),
  });
}

export async function removeLikeFromEpisode(
  episodeId: EpisodeType['id'],
  userId: User['uid']
) {
  const likeId = `${userId}_${episodeId}`;
  const likeRef = doc(db, 'episodeLikes', likeId);

  await deleteDoc(likeRef);
}

export async function getEpisodeUserLike(
  episodeId: EpisodeType['id'],
  userId: User['uid']
) {
  const likeDocRef = doc(db, 'episodeLikes', `${userId}_${episodeId}`);
  const likeDoc = await getDoc(likeDocRef);

  return likeDoc.exists();
}

export async function getUserLikedEpisodes(
  userId: User['uid'],
  limitNumber?: number
) {
  const likesQuery = query(
    collection(db, 'episodeLikes'),
    where('userId', '==', userId)
  );
  const likesSnapshot = await getDocs(likesQuery);
  const episodeIds = likesSnapshot.docs.map((doc) => doc.data().episodeId);

  if (episodeIds.length === 0) {
    return [];
  }

  const episodesQuery = limitNumber
    ? query(
        collection(db, 'episodes'),
        where('__name__', 'in', episodeIds),
        limit(limitNumber)
      )
    : query(collection(db, 'episodes'), where('__name__', 'in', episodeIds));
  const episodesSnapshot = await getDocs(episodesQuery);

  const episodes = await Promise.all(
    episodesSnapshot.docs.map(async (doc) => {
      const episodeData = doc.data() as EpisodeType;
      const podcastId = episodeData.podcastId;
      const podcast = await getPodcast(podcastId);

      return {
        ...episodeData,
        id: doc.id,
        podcastTitle: podcast.title,
      };
    })
  );

  return episodes;
}

export async function getUserLikedCount(userId: User['uid']): Promise<number> {
  const likedQuery = query(
    collection(db, 'episodeLikes'),
    where('userId', '==', userId)
  );

  const countSnapshot = await getCountFromServer(likedQuery);
  return countSnapshot.data().count;
}

export async function addEpisode(
  episodeId: string,
  podcastId: string,
  title: string,
  date: string,
  description: string,
  longDescription: string,
  photo: string,
  audioURL: string | ArrayBuffer | null,
  spotifyURL?: string,
  applePodcastsURL?: string,
  ytMusicURL?: string
) {
  const episodeRef = doc(db, 'episodes', episodeId);

  await setDoc(episodeRef, {
    podcastId,
    title,
    date,
    description,
    longDescription,
    photo,
    audioURL,
    spotifyURL,
    applePodcastsURL,
    ytMusicURL,
    createdAt: Timestamp.now(),
  });
}
