'use client';

import { useState } from 'react';
import { Category } from '@/types';
import useStore from '@/store/useStore';
import { Button } from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';

const categories: Category[] = [
  'Tecnologia',
  'Esportes',
  'Política',
  'Economia',
  'Entretenimento',
  'Saúde',
  'Educação',
  'Ciência',
];

export function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleCategorySelect = (category: Category | null) => {
    setSelectedCategory(category);
    setIsOpen(false);
  };

  // Versão mobile (dropdown)
  const mobileFilter = (
    <div className="relative md:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between"
      >
        <span>
          {selectedCategory ? selectedCategory : 'Todas as Categorias'}
        </span>
        <ChevronDown
          className={`ml-2 h-4 w-4 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </Button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-secondary-200 bg-white shadow-lg dark:border-secondary-800 dark:bg-secondary-900">
          <div className="p-1">
            <button
              className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                selectedCategory === null
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-800'
              }`}
              onClick={() => handleCategorySelect(null)}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                  selectedCategory === category
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-700 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-800'
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Versão desktop (botões)
  const desktopFilter = (
    <div className="hidden flex-wrap gap-2 md:flex">
      <Button
        variant={selectedCategory === null ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleCategorySelect(null)}
      >
        Todas
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleCategorySelect(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );

  return (
    <>
      {mobileFilter}
      {desktopFilter}
    </>
  );
}
