import { auth, db } from '@/firebase/firebaseConfig';
import { IRegisterUserInputData } from '@/schemas/registerSchema';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  setDoc,
} from 'firebase/firestore';
import { mutate } from 'swr';

export async function getUserLevel(userId?: User['uid']): Promise<number> {
  try {
    if (!userId) {
      return 0;
    }
    const userRef = doc(db, 'usersAttributes', userId);
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
  const userRef = doc(db, 'usersAttributes', userId);

  try {
    await setDoc(
      userRef,
      {
        level: increment(trophyLevel),
      },
      { merge: true }
    );

    mutate(`userLevel_${userId}`);
  } catch (error) {
    console.error(error);
  }
}

export async function getUsers() {
  const querySnapshot = await getDocs(collection(db, 'usersAttributes'));
  return querySnapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  })) as User[];
}

export async function createUser(
  data: IRegisterUserInputData
): Promise<{ uid: string }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    const user = userCredential.user;

    await updateProfile(user, { displayName: data.name });

    return {
      uid: user.uid,
    };
  } catch (error: any) {
    console.error('Error creating user:', error.message);
    throw new Error(error.message);
  }
}
