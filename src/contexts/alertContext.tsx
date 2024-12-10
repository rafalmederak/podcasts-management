'use client';

import React, { useContext, useState, useEffect, ReactNode } from 'react';

type IAlertType = 'success' | 'error' | 'warning';

interface IAlert {
  alert: { display: boolean; type: IAlertType; message: string };
  handleAlert: (alertType: IAlertType, alertMessage: string) => void;
}

const AlertContext = React.createContext<IAlert | null>(null);

export const useAlert = () => {
  const alert = useContext(AlertContext);
  if (!alert) {
    throw new Error('Alert is not available');
  }
  return alert;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<IAlert['alert']>({
    display: false,
    type: 'success',
    message: 'Info alert',
  });

  const handleAlert = (alertType: IAlertType, alertMessage: string) => {
    setAlert({
      display: true,
      type: alertType,
      message: alertMessage,
    });
  };

  useEffect(() => {
    if (alert.display == true) {
      const timer = setTimeout(
        () => setAlert({ display: false, type: 'success', message: '' }),
        2000
      );
      return () => {
        clearTimeout(timer);
      };
    }
  }, [alert.display]);

  return (
    <AlertContext.Provider
      value={{
        alert,
        handleAlert,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};
