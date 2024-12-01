import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import React, { Dispatch, SetStateAction } from 'react';

type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  searchTitle?: string;
};

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  searchTitle,
}: SearchBarProps) => {
  return (
    <div className="rounded-md w-full flex items-center sm:max-w-96 md:w-[18rem] gap-x-1 px-3 py-2 text-sm shadow-sm ring-1 ring-inset ring-gray-200 focus:outline-none">
      <MagnifyingGlassIcon className="w-4 h-4" />
      <input
        type="text"
        placeholder={searchTitle ? searchTitle : 'Search...'}
        className="w-full"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
