'use client';

import SearchBar from '@/components/SearchBar';
import { getFAQ } from '@/services/faq.service';
import React, { useMemo, useState } from 'react';
import useSWR from 'swr';

const HelpPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: faqData, isLoading: isFaqLoading } = useSWR('faq', getFAQ);

  const filteredData = useMemo(() => {
    if (!faqData) return [];
    return faqData.filter((item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [faqData, searchQuery]);

  return (
    <div className="page__responsive gap-10">
      <div className="flex justify-between gap-10">
        <h2 className="page__title">FAQ</h2>
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchTitle="Search question..."
        />
      </div>
      <div className="flex flex-col gap-6">
        {isFaqLoading || !faqData ? (
          <p>Loading questions...</p>
        ) : filteredData.length === 0 ? (
          <div className="w-full h-full text-md flex">No questions found.</div>
        ) : (
          filteredData
            ?.sort((a, b) => a.group.localeCompare(b.group))
            .map((item) => (
              <div key={item.id} className="flex flex-col gap-6">
                <span className="h-0.5 w-full bg-gray-100"></span>
                <div className="flex flex-col 2xl:flex-row gap-2">
                  <h3 className="w-full 2xl:w-2/5 font-medium">
                    {item.question}
                  </h3>
                  <p className="w-full 2xl:w-3/5 font-light">{item.answer}</p>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default HelpPage;
