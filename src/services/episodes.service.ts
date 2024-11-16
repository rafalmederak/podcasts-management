import { db } from '@/firebase/firebaseConfig';
import { Episode } from '@/types/episode';
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

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Episode[];
}

export async function getEpisode(episodeId: Episode['id']) {
  const episodeRef = doc(db, 'episodes', episodeId);
  const episodeData = await getDoc(episodeRef);

  if (episodeData.exists()) {
    return { id: episodeData.id, ...episodeData.data() } as Episode;
  } else {
    throw new Error(`Episode with id ${episodeId} not found`);
  }
}

export async function addLikeToEpisode(
  episodeId: Episode['id'],
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
  episodeId: Episode['id'],
  userId: User['uid']
) {
  const likeId = `${userId}_${episodeId}`;
  const likeRef = doc(db, 'episodeLikes', likeId);

  await deleteDoc(likeRef);
}

export async function getEpisodeUserLike(
  episodeId: Episode['id'],
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
      const episodeData = doc.data() as Episode;
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
