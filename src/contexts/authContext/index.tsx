'use client';

import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { auth } from '@/firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

interface AuthContextType {
  userLoggedIn: boolean;
  isEmailUser: boolean;
  //   isGoogleUser: boolean;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  //   const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return () => unsubscribe();
  }, []);

  const initializeUser = (user: User | null) => {
    if (user) {
      setCurrentUser(user);

      const isEmail = user.providerData.some(
        (provider) => provider.providerId === 'password'
      );
      setIsEmailUser(isEmail);

      // const isGoogle = user.providerData.some(
      //   (provider) => provider.providerId === GoogleAuthProvider.PROVIDER_ID
      // );
      // setIsGoogleUser(isGoogle);

      setUserLoggedIn(true);
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
