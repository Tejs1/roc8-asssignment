import { Checkbox } from "@/components/ui/checkbox";
import { Key } from "react";
interface CategoryListProps {
  categories: { name: string; id: number }[];

  userCategories: number[] | undefined;
  handleCategoryToggle: (
    categoryId: number,
    isInterested: boolean | "indeterminate",
  ) => void;
}
export default function CategoryList(props: CategoryListProps) {
  const { categories, userCategories, handleCategoryToggle } = props;
  return (
    <>
      {categories.map((category) => (
        <li key={category.id} className="flex flex-row items-start space-y-0">
          <Checkbox
            id={category.id.toString()}
            checked={userCategories?.includes(category.id)}
            onCheckedChange={(isChecked) =>
              handleCategoryToggle(category.id, isChecked)
            }
          />

          <label
            htmlFor={category.id.toString()}
            className="cursor-pointer pl-3 text-sm font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {category.name}
          </label>
        </li>
      ))}
    </>
  );
}
