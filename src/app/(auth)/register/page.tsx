'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Logo from '@/assets/logo/podcasts-logo.webp';
import { useRouter } from 'next/navigation';
import { createUser } from '@/services/users.service';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import LoadingComponent from '@/components/Loading';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  defaultRegisterUserInputData,
  IRegisterUserInputData,
  registerUserSchema,
} from '@/schemas/registerSchema';
import Input from '@/components/Input';

const RegisterPage = () => {
  const router = useRouter();
  const methods = useForm({
    resolver: yupResolver(registerUserSchema),
    shouldUnregister: false,
    defaultValues: defaultRegisterUserInputData,
    mode: 'onBlur',
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: IRegisterUserInputData) => {
    try {
      const newUser = await createUser(data);
      return router.push('/dashboard/home');
    } catch (error: any) {
      console.error(error);
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
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center gap-6"
        >
          <Controller
            name="name"
            render={({ field, fieldState: { isTouched, error } }) => (
              <Input
                type="text"
                placeholder="Name"
                errorMessage={isTouched && error ? error.message : ''}
                onBlur={field.onBlur}
                onChange={field.onChange}
                name={field.name}
              />
            )}
          />
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
            {isSubmitting ? <LoadingComponent height="full" /> : 'Register'}
          </button>
        </form>
      </FormProvider>
    </div>
  );
};

export default RegisterPage;
