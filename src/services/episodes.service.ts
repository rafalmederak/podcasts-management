import { db } from '@/firebase/firebaseConfig';
import { Episode } from '@/types/episode';
import { collection, getDocs, query, where } from 'firebase/firestore';

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
