import { auth } from '@/firebase/firebaseConfig';
import {
  signInWithEmailAndPassword,
  //   GoogleAuthProvider,
  UserCredential,
} from 'firebase/auth';

// export const doCreateUserWithEmailAndPassword = async (
//   email: string,
//   password: string
// ): Promise<UserCredential> => {
//   return createUserWithEmailAndPassword(auth, email, password);
// };

export const doSignInWithEmailAndPassword = (
  email: string,
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

// export const doSignInWithGoogle = async (): Promise<void> => {
//   const provider = new GoogleAuthProvider();
//   const result = await signInWithPopup(auth, provider);
//   const user = result.user;
// };

export const doSignOut = (): Promise<void> => {
  return auth.signOut();
};
