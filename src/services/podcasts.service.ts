import { db } from '@/firebase/firebaseConfig';
import { Podcast } from '@/types/podcast';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

export async function getPodcasts() {
  const querySnapshot = await getDocs(collection(db, 'podcasts'));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Podcast[];
}

export async function getPodcast(podcastId: Podcast['id']) {
  const podcastRef = doc(db, 'podcasts', podcastId);
  const podcastData = await getDoc(podcastRef);

  if (podcastData.exists()) {
    return { id: podcastData.id, ...podcastData.data() } as Podcast;
  } else {
    throw new Error(`Podcast with id ${podcastId} not found`);
  }
}
