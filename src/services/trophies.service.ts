import { db } from '@/firebase/firebaseConfig';
import { Trophy, UserTrophy } from '@/types/trophy';
import { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { mutate } from 'swr';
import { getEpisode } from './episodes.service';
import { deleteObject, getStorage, listAll, ref } from 'firebase/storage';

type UserTrophyData = {
  trophyId: string;
  userId: string;
  answer: number;
  timestamp: Timestamp;
  blockedTime?: Timestamp;
};

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
  const trophyRef = doc(db, 'userTrophies', `${trophyId}_${userId}`);

  const trophyDoc = await getDoc(trophyRef);

  const data: UserTrophyData = {
    trophyId,
    userId,
    answer,
    timestamp: Timestamp.now(),
  };

  if (answer === -1) {
    data['blockedTime'] = Timestamp.now();
  } else {
    if (trophyDoc.exists()) {
      await updateDoc(trophyRef, {
        blockedTime: deleteField(),
      });
    }
  }

  if (trophyDoc.exists()) {
    await updateDoc(trophyRef, data);
  } else {
    await setDoc(trophyRef, data);
  }

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

export async function addTrophy({
  id: trophyId,
  episodeId,
  title,
  photo,
  description,
  level,
  task,
  goodAnswerIndex,
}: Trophy) {
  const trophyRef = doc(db, 'trophies', trophyId);

  await setDoc(trophyRef, {
    trophyId,
    episodeId,
    title,
    photo,
    description,
    level,
    task,
    goodAnswerIndex,
    createdAt: Timestamp.now(),
  });
}

export async function deleteTrophy(
  trophyId: string,
  params: { podcastId: string; episodeId: string }
) {
  const userTrophiesQuery = query(
    collection(db, 'userTrophies'),
    where('trophyId', '==', trophyId)
  );
  const userTrophiesSnapshot = await getDocs(userTrophiesQuery);

  const deleteUserTrophiesPromises = userTrophiesSnapshot.docs.map((doc) =>
    deleteDoc(doc.ref)
  );
  await Promise.all(deleteUserTrophiesPromises);

  const trophyRef = doc(db, 'trophies', trophyId);
  await deleteDoc(trophyRef);

  const storage = getStorage();
  const trophyFolderPath = `podcasts/${params.podcastId}/episodes/${params.episodeId}/trophies/${trophyId}`;
  const trophyFolderRef = ref(storage, trophyFolderPath);

  try {
    const listResult = await listAll(trophyFolderRef);

    const deleteFilesPromises = listResult.items.map((fileRef) =>
      deleteObject(fileRef)
    );
    await Promise.all(deleteFilesPromises);
  } catch (error) {
    console.error(error);
  }
}

export const updateTrophy = async (trophy: Trophy) => {
  try {
    const docRef = doc(db, 'trophies', trophy.id);
    await setDoc(docRef, trophy, { merge: true });
  } catch (error) {
    console.error(error);
  }
};

export async function getTrophyById(trophyId: string): Promise<Trophy | null> {
  try {
    const trophyRef = doc(db, 'trophies', trophyId);
    const trophyDoc = await getDoc(trophyRef);

    if (trophyDoc.exists()) {
      return { id: trophyDoc.id, ...trophyDoc.data() } as Trophy;
    } else {
      console.error('Trophy not found');
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}
