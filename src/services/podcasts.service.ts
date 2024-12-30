import { db } from '@/firebase/firebaseConfig';
import { Podcast } from '@/types/podcast';
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
  limit,
  getCountFromServer,
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
  const subscribeRef = doc(db, 'podcastSubscriptions', subscribeId);

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
  const subscribeRef = doc(db, 'podcastSubscriptions', subscribeId);

  await deleteDoc(subscribeRef);
}

export async function getPodcastUserSubscription(
  podcastId: Podcast['id'],
  userId: User['uid']
) {
  const subscribeDocRef = doc(
    db,
    'podcastSubscriptions',
    `${userId}_${podcastId}`
  );
  const subscribeDoc = await getDoc(subscribeDocRef);

  return subscribeDoc.exists();
}

export async function getUserSubscribedPodcasts(
  userId: User['uid'],
  limitNumber?: number
) {
  const subscriptionsQuery = query(
    collection(db, 'podcastSubscriptions'),
    where('userId', '==', userId)
  );
  const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
  const podcastIds = subscriptionsSnapshot.docs.map(
    (doc) => doc.data().podcastId
  );

  if (podcastIds.length === 0) {
    return [];
  }

  const podcastsQuery = limitNumber
    ? query(
        collection(db, 'podcasts'),
        where('__name__', 'in', podcastIds),
        limit(limitNumber)
      )
    : query(collection(db, 'podcasts'), where('__name__', 'in', podcastIds));
  const podcastsSnapshot = await getDocs(podcastsQuery);

  return podcastsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Podcast[];
}

export async function getUserSubscriptionsCount(
  userId: User['uid']
): Promise<number> {
  const subscriptionsQuery = query(
    collection(db, 'podcastSubscriptions'),
    where('userId', '==', userId)
  );

  const countSnapshot = await getCountFromServer(subscriptionsQuery);
  return countSnapshot.data().count;
}

export async function addPodcast(
  podcastId: string,
  userId: string,
  photo: string,
  title: string,
  host: string,
  description: string
) {
  const podcastRef = doc(db, 'podcasts', podcastId);

  await setDoc(podcastRef, {
    userId,
    photo,
    title,
    host,
    description,
    createdAt: Timestamp.now(),
  });
}
