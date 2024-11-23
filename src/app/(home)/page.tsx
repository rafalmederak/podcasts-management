import Link from 'next/link';
import Image from 'next/image';
import HeroMain from '@/assets/hero/podcast-management-hero.png';

export default function Home() {
  return (
    <main className="flex flex-col 2xl:flex-row min-h-screen items-start 2xl:items-center justify-center p-10 2xl:p-40 gap-20 2xl:gap-40">
      <div className="flex flex-col w-full 2xl:w-2/5 gap-8 items-start">
        <h1 className=" text-2xl font-semibold">
          Revolutionize How You Listen to Podcasts
        </h1>
        <div className="flex flex-col gap-1">
          <i>Discover. Enjoy. Achieve.</i>
          <p>
            Unlock a new way to experience podcasts. Complete tasks, earn
            trophies and climb the rankings by listening to your favorite
            episodes.
          </p>
        </div>
        <Link
          href={'/login'}
          className="hover:text-white hover:bg-defaultBlue-300 py-2 px-4 rounded-md bg-white text-defaultBlue-300 border-2 border-defaultBlue-300 hover:scale-[1.025] transition-all"
        >
          Go to login page -&gt;
        </Link>
      </div>
      <div className="w-full 2xl:w-3/5 relative">
        <Image
          src={HeroMain}
          alt="Podcasts Management Platform"
          layout="intrinsic"
          className="rounded-lg shadow-md object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw"
        />
      </div>
    </main>
  );
}
