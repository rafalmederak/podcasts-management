import React from 'react';

type UserInitialsLogoProps = {
  displayName?: string | null;
  width: number;
  height: number;
  rounded: string;
};

const UserInitialsLogo = ({
  displayName,
  width,
  height,
  rounded,
}: UserInitialsLogoProps) => {
  if (!displayName) {
    return null;
  }

  return (
    <p
      className={`flex items-center justify-center rounded-${rounded} shadow-md w-${width} h-${height} text-center border`}
    >
      {displayName
        .split(' ')
        .map((displayName: string) => displayName[0])
        .join('')
        .toUpperCase()}
    </p>
  );
};

export default UserInitialsLogo;
