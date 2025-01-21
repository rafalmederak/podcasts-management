import React, { ComponentProps } from 'react';

type TextareaProps = {
  errorMessage?: string;
} & ComponentProps<'textarea'>;

const Textarea = ({ errorMessage, ...textareaProps }: TextareaProps) => {
  return (
    <div className="flex flex-col w-full h-60">
      <textarea
        {...textareaProps}
        className="rounded-sm border border-1 p-2 w-full h-full resize-none"
      />
      {errorMessage && (
        <p className="text-red-500 text-sm font-medium my-1.5">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default Textarea;
