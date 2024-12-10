import React, { ComponentProps } from 'react';

type InputProps = {
  errorMessage?: string;
} & ComponentProps<'input'>;

const Input = ({ errorMessage, ...inputProps }: InputProps) => {
  return (
    <div>
      <input {...inputProps} className="login__input" />
      {errorMessage && (
        <p className=" text-red-500 text-sm font-medium my-1.5">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default Input;
