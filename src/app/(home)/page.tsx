import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-8">
      <h1 className=" text-3xl">Hero section (in progress)</h1>
      <Link
        href={'/login'}
        className="hover:text-white hover:bg-defaultBlue-300 py-3 px-4 rounded-md bg-white text-defaultBlue-300 border-2 border-defaultBlue-300 hover:scale-105 transition-all"
      >
        Go to login page -&gt;
      </Link>
    </main>
  );
}
