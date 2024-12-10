import { auth } from '@/firebase/firebaseConfig';
import { ILoginUserInputData } from '@/schemas/loginSchema';
import { signInWithEmailAndPassword, UserCredential } from 'firebase/auth';

export const doSignInWithEmailAndPassword = (
  data: ILoginUserInputData
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, data.email, data.password);
};

export const doSignOut = (): Promise<void> => {
  return auth.signOut();
};
