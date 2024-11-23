'use client';

import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { auth, db } from '@/firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { getUserLevel } from '@/services/users.service';
import { ExtendedUser } from '@/types/user';

interface AuthContextType {
  userLoggedIn: boolean;
  isEmailUser: boolean;
  //   isGoogleUser: boolean;
  currentUser: ExtendedUser | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<ExtendedUser | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  //   const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return () => unsubscribe();
  }, []);

  const initializeUser = async (user: User | null) => {
    if (user) {
      const isEmail = user.providerData.some(
        (provider) => provider.providerId === 'password'
      );
      setIsEmailUser(isEmail);

      // const isGoogle = user.providerData.some(
      //   (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
      // );
      // setIsGoogleUser(isGoogle);

      setUserLoggedIn(true);
      const userLevel = await getUserLevel(user.uid);

      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      const firestoreUserData = userDoc.exists() ? userDoc.data() : {};
      const extendedUser: ExtendedUser = {
        ...user,
        displayName: firestoreUserData.displayName || user.displayName || '',
        level: userLevel,
        ...firestoreUserData,
      };

      setCurrentUser(extendedUser);
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
    }

    setLoading(false);
  };

  const value: AuthContextType = {
    userLoggedIn,
    isEmailUser,
    // isGoogleUser,
    currentUser,
    setCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
