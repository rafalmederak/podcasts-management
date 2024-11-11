import { db } from '@/firebase/firebaseConfig';
import { Episode } from '@/types/episode';
import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';

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
