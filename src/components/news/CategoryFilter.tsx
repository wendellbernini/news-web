"use client";

import { Category } from "@/types";
import useStore from "@/store/useStore";
import { Button } from "@/components/ui/Button";

const categories: Category[] = [
  "Tecnologia",
  "Esportes",
  "Política",
  "Economia",
  "Entretenimento",
  "Saúde",
  "Educação",
  "Ciência",
];

export function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useStore();

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedCategory === null ? "default" : "ghost"}
        size="sm"
        onClick={() => setSelectedCategory(null)}
      >
        Todas
      </Button>
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "ghost"}
          size="sm"
          onClick={() => setSelectedCategory(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
