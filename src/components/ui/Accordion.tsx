'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionProps {
  items: {
    question: string;
    answer: string;
  }[];
}

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="divide-y divide-secondary-200 rounded-lg border border-secondary-200 dark:divide-secondary-800 dark:border-secondary-800">
      {items.map((item, index) => (
        <div key={index} className="relative">
          <button
            onClick={() => toggleItem(index)}
            className="flex w-full items-center justify-between gap-4 p-6 text-left"
          >
            <h3 className="text-lg font-medium">{item.question}</h3>
            <ChevronDown
              className={cn(
                'h-5 w-5 shrink-0 transition-transform duration-200',
                openIndex === index ? 'rotate-180' : ''
              )}
            />
          </button>
          <div
            className={cn(
              'grid transition-all duration-200',
              openIndex === index
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0'
            )}
          >
            <div className="overflow-hidden">
              <div className="px-6 pb-6 pt-0">
                <p className="text-secondary-600 dark:text-secondary-400">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
