'use client';

import { getFAQ } from '@/services/faq.service';
import React from 'react';
import useSWR from 'swr';

const HelpPage = () => {
  const { data: faqData, isLoading: isFaqLoading } = useSWR('faq', getFAQ);
  return (
    <div className="page__responsive gap-10">
      <h2 className="page__title">FAQ</h2>
      <div className="flex flex-col gap-6">
        {isFaqLoading || !faqData ? (
          <p>Loading questions...</p>
        ) : (
          faqData?.map((item) => (
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
