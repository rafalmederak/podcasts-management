'use server';

import { firebaseAdmin } from '@/firebase/firebaseAdminConfig';
import { UserRanking } from '@/types/user';

type PodcastRankingAttributes = {
  podcastId: string;
  userIdToken: string;
};

export const getUsersAttributes = async ({
  userIdToken,
}: {
  userIdToken: string;
}) => {
  try {
    const decodedUser = await firebaseAdmin.auth().verifyIdToken(userIdToken);

    if (!decodedUser.uid) {
      throw new Error('Forbidden');
    }

    const userRecords = await firebaseAdmin.auth().listUsers();

    const usersAttributes = await Promise.all(
      userRecords.users.map(async (userRecord) => {
        const userLevel = await firebaseAdmin
          .firestore()
          .collection('usersAttributes')
          .doc(userRecord.uid)
          .get();

        return {
          uid: userRecord.uid,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          createdAt: userRecord.metadata.creationTime,
          level: userLevel.data()?.level || 0,
        };
      })
    );

    return usersAttributes;
  } catch (error) {
    console.error(error);
  }
};

export async function getPodcastRanking({
  podcastId,
  userIdToken,
}: PodcastRankingAttributes) {
  const decodedUser = await firebaseAdmin.auth().verifyIdToken(userIdToken);

  if (!decodedUser.uid) {
    throw new Error('Forbidden');
  }

  try {
    const episodesRecords = await firebaseAdmin
      .firestore()
      .collection('episodes')
      .where('podcastId', '==', podcastId)
      .get();

    const userTrophiesCount: { [userId: string]: number } = {};

    for (const episode of episodesRecords.docs) {
      const episodeTrophies = await firebaseAdmin
        .firestore()
        .collection('trophies')
        .where('episodeId', '==', episode.id)
        .get();

      for (const episodeTrophy of episodeTrophies.docs) {
        const userTrophies = await firebaseAdmin
          .firestore()
          .collection('userTrophies')
          .where('trophyId', '==', episodeTrophy.id)
          .get();

        userTrophies.forEach((doc) => {
          const userId = doc.data().userId;
          userTrophiesCount[userId] = (userTrophiesCount[userId] || 0) + 1;
        });
      }
    }

    const uniqueUsersTrophies = await Promise.all(
      Object.entries(userTrophiesCount).map(async ([userId, trophiesCount]) => {
        const userRecord = await firebaseAdmin.auth().getUser(userId);

        return {
          uid: userRecord.uid,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          trophiesCount,
        };
      })
    );

    uniqueUsersTrophies.sort((a, b) => b.trophiesCount - a.trophiesCount);

    const groupedUsers: UserRanking[] = [];
    let currentRank = 1;

    uniqueUsersTrophies.forEach((user, index, array) => {
      if (index > 0 && array[index - 1].trophiesCount !== user.trophiesCount) {
        currentRank = index + 1;
      }
      groupedUsers.push({ ...user, rank: currentRank });
    });

    return groupedUsers;
  } catch (error) {
    console.error(error);
  }
}
