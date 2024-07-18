"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export default function Categories() {
  const [page, setPage] = useState(1);
  const utils = api.useUtils();

  const {
    data,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = api.auth.getCategories.useQuery({ page, pageSize: 6 });

  const {
    data: userCategories,
    isLoading: userCategoriesLoading,
    refetch: refetchUserCategories,
  } = api.auth.getUserCategories.useQuery();

  const updateUserCategory = api.auth.updateUserCategories.useMutation({
    onMutate: async (newCategory) => {
      await utils.auth.getUserCategories.cancel();
      const previousCategories = utils.auth.getUserCategories.getData();

      utils.auth.getUserCategories.setData(undefined, (old) => {
        const oldCategories = old ?? [];
        if (newCategory.isInterested) {
          return [...oldCategories, newCategory.categoryId];
        } else {
          return oldCategories.filter((id) => id !== newCategory.categoryId);
        }
      });

      return { previousCategories };
    },
    onError: (err, newCategory, context) => {
      utils.auth.getUserCategories.setData(
        undefined,
        context?.previousCategories,
      );
    },
    onSettled: () => {
      utils.auth.getUserCategories.invalidate();
    },
  });

  const handleCategoryToggle = (categoryId: number, isInterested: boolean) => {
    updateUserCategory.mutate({ categoryId, isInterested });
  };

  if (categoriesLoading || userCategoriesLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Categories</h1>
      <ul>
        {data?.categories.map((category) => (
          <li key={category.id}>
            {category.name}
            <input
              type="checkbox"
              checked={userCategories?.includes(category.id)}
              onChange={(e) =>
                handleCategoryToggle(category.id, e.target.checked)
              }
            />
          </li>
        ))}
      </ul>
      <div>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {data?.totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(data?.totalPages || 1, p + 1))}
          disabled={page === data?.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
