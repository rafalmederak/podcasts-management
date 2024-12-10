'use client';
import { CheckIcon, InformationCircleIcon } from '@heroicons/react/24/solid';
import React, { ComponentProps } from 'react';

export type IAlertProps = {
  type: 'error' | 'warning' | 'success';
  title: string;
};

const iconRender = (type: IAlertProps['type']) => {
  if (type === 'error' || type === 'warning') {
    return <InformationCircleIcon className="w-5 h-5" />;
  }

  return <CheckIcon className="w-5 h-5" />;
};

type IAlertTypeStyles = {
  [key in IAlertProps['type']]: ComponentProps<'div'>['className'];
};

const Alert = ({ type, title }: IAlertProps) => {
  const alertTypeStyles: IAlertTypeStyles = {
    error: 'bg-red-50/80 border-red-100 text-red-600',
    warning: 'bg-orange-50/80 border-orange-100 text-orange-600',
    success: 'bg-green-50/80 border-green-100 text-green-600',
  };

  return (
    <div
      className={`flex items-center justify-start fixed p-4 rounded-lg right-1/2 translate-x-1/2 top-10 gap-4 z-20 border shadow-lg shadow-slate-200 ${alertTypeStyles[type]} `}
    >
      <span className="flex items-center justify-center">
        {iconRender(type)}
      </span>
      <p className=" text-normal text-lg font-medium"> {title}</p>
    </div>
  );
};

export default Alert;
