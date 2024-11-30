'use client';

import Image from 'next/image';
import React, { FormEvent, useEffect, useState } from 'react';
import Logo from '@/assets/logo/podcasts-logo.webp';
import { doSignInWithEmailAndPassword } from '@/contexts/authContext/auth';
import { useAuth } from '@/contexts/authContext';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const { userLoggedIn } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const router = useRouter();
  useEffect(() => {
    if (userLoggedIn) {
      router.replace('/dashboard/home');
    }
  }, [userLoggedIn, router]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isSigningIn) {
      setIsSigningIn(true);
      try {
        await doSignInWithEmailAndPassword(email, password);
      } catch (error) {
        setErrorMessage((error as Error).message);
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  //   const onGoogleSignIn = async (e: FormEvent) => {
  //     e.preventDefault();
  //     if (!isSigningIn) {
  //       setIsSigningIn(true);
  //       try {
  //         await doSignInWithGoogle();
  //       } catch (error) {
  //         setErrorMessage((error as Error).message);
  //       } finally {
  //         setIsSigningIn(false);
  //       }
  //     }
  //   };

  return (
    <div className="page__width flex flex-col items-center justify-center min-h-screen gap-14 px-4 py-10">
      <Image
        src={Logo}
        alt="logo"
        priority={true}
        className="w-60 rounded-lg"
      />
      <h1 className="text-4xl font-semibold text-center">
        Podcasts Management Platform
      </h1>
      <div className="flex flex-col items-center gap-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Email"
            className="login__input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Password"
            className="login__input"
          />
          <button
            type="submit"
            disabled={isSigningIn}
            className="login__submit"
          >
            Sign In
          </button>
          {errorMessage && <p>{errorMessage}</p>}
        </form>
        {/* Google Integration */}
        {/* <p className="font-medium">OR</p>
        <p>Continue with Google</p> */}
      </div>
    </div>
  );
};

export default LoginPage;
