'use client';

import Image from 'next/image';
import React, { FormEvent, useState } from 'react';
import Logo from '@/assets/logo/podcasts-logo.webp';
import { doSignInWithEmailAndPassword } from '@/contexts/authContext/auth';
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

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
        <div className="flex gap-1">
          <p>Don't have an account?</p>
          <Link href={'/register'} className="text-defaultBlue-400">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
