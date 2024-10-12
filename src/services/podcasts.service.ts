import { db } from '@/firebase/firebaseConfig';
import { Podcast } from '@/types/podcast';
import { collection, getDocs } from 'firebase/firestore';

export async function getPodcasts() {
  const querySnapshot = await getDocs(collection(db, 'podcasts'));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Podcast[];
}
