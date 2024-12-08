import { auth } from '@/firebase/firebaseConfig';
import { signInWithEmailAndPassword, UserCredential } from 'firebase/auth';

export const doSignInWithEmailAndPassword = (
  email: string,
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const doSignOut = (): Promise<void> => {
  return auth.signOut();
};
