"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategoryFilterProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "team", label: "Team" },
];

export function CategoryFilter({
  value = "all",
  onValueChange,
}: CategoryFilterProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.value} value={category.value}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}