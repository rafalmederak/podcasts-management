'use client';

import Image from 'next/image';
import React from 'react';
import Logo from '@/assets/logo/podcasts-logo.webp';
import { doSignInWithEmailAndPassword } from '@/contexts/authContext/auth';
import Link from 'next/link';
import { useForm, FormProvider, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  defaultLoginUserInputData,
  ILoginUserInputData,
  loginUserSchema,
} from '@/schemas/loginSchema';
import LoadingComponent from '@/components/Loading';
import Input from '@/components/Input';
import { useAlert } from '@/contexts/alertContext';
import { FirebaseError } from 'firebase/app';
import { AuthErrorCodes } from 'firebase/auth';

const LoginPage = () => {
  const { alert, handleAlert } = useAlert();
  const onSubmit = async (data: ILoginUserInputData) => {
    try {
      await doSignInWithEmailAndPassword(data);
    } catch (error) {
      console.error(error);

      if (error instanceof FirebaseError) {
        switch (error.code) {
          case AuthErrorCodes.INVALID_LOGIN_CREDENTIALS:
            handleAlert('error', 'Invalid e-mail or password.');
            break;
          case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
            handleAlert(
              'error',
              'Access to your account has been temporarily blocked due to unsuccessful login attempts, please try logging in again later.'
            );
            break;
          default:
            handleAlert('error', `An error occurred while logging in.`);
        }

        return;
      }

      handleAlert('error', `An error occurred while logging in.`);
    }
  };

  const methods = useForm({
    resolver: yupResolver(loginUserSchema),
    shouldUnregister: false,
    defaultValues: defaultLoginUserInputData,
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

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
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="email"
              render={({ field, fieldState: { isTouched, error } }) => (
                <Input
                  type="email"
                  placeholder="Email"
                  errorMessage={isTouched && error ? error.message : ''}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  name={field.name}
                />
              )}
            />
            <Controller
              name="password"
              render={({ field, fieldState: { isTouched, error } }) => (
                <Input
                  type="password"
                  placeholder="Password"
                  errorMessage={isTouched && error ? error.message : ''}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  name={field.name}
                />
              )}
            />

            <button type="submit" className="login__submit">
              {isSubmitting ? <LoadingComponent height="full" /> : 'Sign in'}
            </button>
          </form>
        </FormProvider>
        <div className="flex gap-1">
          <p>Don't have an account?</p>
          <Link href={'/register'} className="text-defaultBlue-400">
            Register
          </Link>
        </div>
        <div className="flex gap-1">
          <p>Forgot password?</p>
          <Link href={'/reset-password'} className="text-defaultBlue-400">
            Reset password
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
