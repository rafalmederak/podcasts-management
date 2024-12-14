import { db } from '@/firebase/firebaseConfig';
import { Trophy, UserTrophy } from '@/types/trophy';
import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore';
import { mutate } from 'swr';
import { v4 as uuidv4 } from 'uuid';
import { getEpisode } from './episodes.service';

export async function getEpisodeTrophies(episodeId: string) {
  const q = query(
    collection(db, 'trophies'),
    where('episodeId', '==', episodeId)
  );

  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Trophy[];
}

export async function getEpisodeUserTrophies(
  episodeId: string,
  userId?: string
) {
  const trophiesQuery = query(
    collection(db, 'trophies'),
    where('episodeId', '==', episodeId)
  );
  const trophiesSnapshot = await getDocs(trophiesQuery);
  const trophyIds = trophiesSnapshot.docs.map((doc) => doc.id);

  const userTrophiesQuery = query(
    collection(db, 'userTrophies'),
    where('userId', '==', userId),
    where('trophyId', 'in', trophyIds)
  );
  const querySnapshot = await getDocs(userTrophiesQuery);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as UserTrophy[];
}

export async function addEpisodeUserTrophie(
  trophyId: string,
  userId: string,
  answer: number
) {
  const id = uuidv4();
  const likeRef = doc(db, 'userTrophies', id);

  await setDoc(likeRef, {
    trophyId,
    userId,
    answer,
    createdAt: Timestamp.now(),
  });

  mutate(`userTrophies_${userId}`);
}

export async function getUserTrophy(trophyId: string, userId: string) {
  const userTrophiesQuery = query(
    collection(db, 'userTrophies'),
    where('userId', '==', userId),
    where('trophyId', '==', trophyId)
  );

  const querySnapshot = await getDocs(userTrophiesQuery);

  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserTrophy;
  } else {
    return null;
  }
}

export async function getUserTrophies(userId: User['uid']) {
  const userTrophiesQuery = query(
    collection(db, 'userTrophies'),
    where('userId', '==', userId)
  );
  const userTrophiesSnapshot = await getDocs(userTrophiesQuery);
  const trophyIds = userTrophiesSnapshot.docs.map((doc) => doc.data().trophyId);

  if (trophyIds.length === 0) {
    return [];
  }

  const trophiesQuery = query(
    collection(db, 'trophies'),
    where('__name__', 'in', trophyIds)
  );
  const trophiesSnapshot = await getDocs(trophiesQuery);

  const trophies = await Promise.all(
    trophiesSnapshot.docs.map(async (doc) => {
      const trophyData = doc.data() as Trophy;
      const { episodeId } = trophyData;

      const episode = await getEpisode(episodeId);

      return {
        ...trophyData,
        id: doc.id,
        episode,
      };
    })
  );

  return trophies;
}
