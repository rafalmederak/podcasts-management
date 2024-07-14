import Image from 'next/image';
import React from 'react';
import Logo from '@/assets/logo/podcasts-logo.webp';

const LoginPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-14 px-4 py-10">
      <Image src={Logo} alt="logo" className="w-60 rounded-lg" />
      <h1 className="text-4xl font-semibold text-center">
        Podcasts Management Platform
      </h1>
      <div className="flex flex-col items-center gap-6">
        <form action="" className="flex flex-col gap-4">
          <input type="text" placeholder="Email" className="login__input" />
          <input
            type="password"
            placeholder="Password"
            className="login__input"
          />
          <button className="login__submit">Sign In</button>
        </form>
        {/* Google Integration */}
        {/* <p className="font-medium">OR</p>
        <p>Continue with Google</p> */}
      </div>
    </div>
  );
};

export default LoginPage;
