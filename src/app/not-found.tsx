import Link from 'next/link';
import React from 'react';

const NotFound = () => {
  return (
    <div className="flex flex-col gap-6 items-center justify-center min-h-screen">
      <h2 className="text-5xl font-medium">404</h2>
      <p>The page doesn't exist.</p>
      <Link href="/dashboard/home" className="text-defaultBlue-500">
        Home
      </Link>
    </div>
  );
};

export default NotFound;
