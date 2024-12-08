'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Logo from '@/assets/logo/podcasts-logo.webp';
import { useRouter } from 'next/navigation';
import { createUser } from '@/services/users.service';
const RegisterPage = () => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const newUser = await createUser(email, password, displayName);
      return router.push('/dashboard/home');
    } catch (error: any) {
      setError(error.message);
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
      <h1 className="text-2xl font-semibold">Register</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-6"
      >
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          placeholder="Name"
          className="login__input"
        />
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
        <button type="submit" className="login__submit">
          Register
        </button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default RegisterPage;
