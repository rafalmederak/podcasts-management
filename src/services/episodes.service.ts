import { db } from '@/firebase/firebaseConfig';
import { Episode } from '@/types/episode';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
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
