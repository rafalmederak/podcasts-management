import React, { ComponentProps } from 'react';

type InputProps = {
  errorMessage?: string;
} & ComponentProps<'input'>;

const FormInput = ({ errorMessage, ...inputProps }: InputProps) => {
  return (
    <div className="flex flex-col w-full">
      <input
        {...inputProps}
        className="rounded-sm border border-1 p-2 w-full"
      />
      {errorMessage && (
        <p className=" text-red-500 text-sm font-medium my-1.5">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default FormInput;
