import { db } from '@/firebase/firebaseConfig';
import { ExtendedUser } from '@/types/user';
import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  updateDoc,
} from 'firebase/firestore';

export async function getUserLevel(userId: User['uid']): Promise<number> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      return userData.level;
    } else {
      return 0;
    }
  } catch (error) {
    console.error(error);
    return 0;
  }
}

export async function addTrophyLevelToUser(
  userId: User['uid'],
  trophyLevel: number
): Promise<void> {
  const userRef = doc(db, 'users', userId);

  try {
    await updateDoc(userRef, {
      level: increment(trophyLevel),
    });
  } catch (error) {
    console.error(error);
  }
}

export async function getUsers() {
  const querySnapshot = await getDocs(collection(db, 'users'));
  return querySnapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  })) as ExtendedUser[];
}
