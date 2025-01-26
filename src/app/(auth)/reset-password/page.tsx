'use client';

import React, { useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Image from 'next/image';
import Logo from '@/assets/logo/podcasts-logo.webp';
import { sendPasswordResetEmail } from 'firebase/auth';
import Input from '@/components/Input';
import LoadingComponent from '@/components/Loading';
import { useRouter } from 'next/navigation';
import { auth } from '@/firebase/firebaseConfig';
import Modal from '@/components/Modal';

const schema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

const ResetPassword = () => {
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const router = useRouter();

  const methods = useForm({
    resolver: yupResolver(schema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = methods;

  const onSubmit = async (data: { email: string }) => {
    try {
      await sendPasswordResetEmail(auth, data.email);
      setModal({
        isOpen: true,
        title: 'Success',
        message: 'Password reset email sent successfully!',
        onConfirm: () => {
          setModal({ ...modal, isOpen: false });
          router.push('/login');
        },
      });
    } catch (error: any) {
      setModal({
        isOpen: true,
        title: 'Error',
        message: error.message || 'Failed to send password reset email.',
        onConfirm: () => setModal({ ...modal, isOpen: false }),
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-6 gap-6">
      <Image
        src={Logo}
        alt="logo"
        priority={true}
        className="w-60 rounded-lg mb-4"
      />
      <h1 className="text-2xl font-semibold mb-6">Reset Password</h1>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center gap-6"
        >
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState: { isTouched, error } }) => (
              <Input
                type="email"
                placeholder="Email"
                errorMessage={isTouched && error ? error.message : ''}
                {...field}
              />
            )}
          />

          <button
            type="submit"
            className="login__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoadingComponent height="full" />
            ) : (
              'Send Reset Email'
            )}
          </button>
        </form>
      </FormProvider>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.onConfirm || undefined}
        confirmText="OK"
        confirmColor="bg-defaultBlue-300"
        cancelButton={false}
      />
    </div>
  );
};

export default ResetPassword;
