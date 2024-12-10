'use client';
import React, { useEffect, useState } from 'react';
import { auth } from '@/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import LoadingComponent from '@/components/Loading';
import { useAlert } from '@/contexts/alertContext';
import Alert from '@/components/Alert';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { alert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user && user.displayName) {
            return router.push('/dashboard/home');
          }

          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error(error);
        setError('An error has occurred. Please try again.');
        setLoading(false);
      }
    };

    checkUserStatus();
  }, []);

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      {children}
      {alert.display && <Alert type={alert.type} title={alert.message} />}
    </>
  );
};

export default AuthLayout;
