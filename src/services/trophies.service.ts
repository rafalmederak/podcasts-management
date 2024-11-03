import { db } from '@/firebase/firebaseConfig';
import { Trophy, UserTrophy } from '@/types/trophy';
import { collection, getDocs, query, where } from 'firebase/firestore';

export async function getPodcastRanking(podcastId: string) {
  try {
    const episodesQuery = query(
      collection(db, 'episodes'),
      where('podcastId', '==', podcastId)
    );
    const episodesSnapshot = await getDocs(episodesQuery);
    const episodeIds = episodesSnapshot.docs.map((doc) => doc.id);

    if (episodeIds.length === 0) {
      return [];
    }

    const trophiesQuery = query(
      collection(db, 'trophies'),
      where('episodeId', 'in', episodeIds)
    );
    const trophiesSnapshot = await getDocs(trophiesQuery);
    const trophyIds = trophiesSnapshot.docs.map((doc) => doc.id);

    if (trophyIds.length === 0) {
      return [];
    }

    const userTrophiesQuery = query(
      collection(db, 'userTrophies'),
      where('trophyId', 'in', trophyIds)
    );
    const userTrophiesSnapshot = await getDocs(userTrophiesQuery);

    const userTrophiesCount: { [key: string]: number } = {};
    userTrophiesSnapshot.forEach((doc) => {
      const userId = doc.data().userId;
      userTrophiesCount[userId] = (userTrophiesCount[userId] || 0) + 1;
    });

    const userIds = Object.keys(userTrophiesCount);
    const usersQuery = query(
      collection(db, 'users'),
      where('__name__', 'in', userIds)
    );
    const usersSnapshot = await getDocs(usersQuery);

    const ranking = usersSnapshot.docs.map((doc) => {
      const userId = doc.id;
      const userData = doc.data();
      return {
        userId,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        trophiesCount: userTrophiesCount[userId],
      };
    });

    ranking.sort((a, b) => b.trophiesCount - a.trophiesCount);

    return ranking;
  } catch (error) {
    console.error(error);
  }
}

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
