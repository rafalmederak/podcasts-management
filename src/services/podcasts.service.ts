import { db } from '@/firebase/firebaseConfig';
import { Podcast } from '@/types/podcast';
import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

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

export async function subscribePodcast(
  podcastId: Podcast['id'],
  userId: User['uid']
) {
  const subscribeId = `${userId}_${podcastId}`;
  const subscribeRef = doc(db, 'podcastSubscribtions', subscribeId);

  await setDoc(subscribeRef, {
    podcastId,
    userId,
    createdAt: Timestamp.now(),
  });
}

export async function unsubscribePodcast(
  podcastId: Podcast['id'],
  userId: User['uid']
) {
  const subscribeId = `${userId}_${podcastId}`;
  const subscribeRef = doc(db, 'podcastSubscribtions', subscribeId);

  await deleteDoc(subscribeRef);
}

export async function getPodcastUserSubscription(
  podcastId: Podcast['id'],
  userId: User['uid']
) {
  const subscribeDocRef = doc(
    db,
    'podcastSubscribtions',
    `${userId}_${podcastId}`
  );
  const subscribeDoc = await getDoc(subscribeDocRef);

  return subscribeDoc.exists();
}
