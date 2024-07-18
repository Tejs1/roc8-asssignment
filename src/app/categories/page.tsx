"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export default function Categories() {
  const [page, setPage] = useState(1);
  const {
    data,
    isLoading,
    refetch: refetchCategories,
  } = api.auth.getCategories.useQuery({ page, pageSize: 6 });

  const { data: userCategories, refetch: refetchUserCategories } =
    api.auth.getUserCategories.useQuery();

  const queryClient = api.useContext();

  const updateUserCategory = api.auth.updateUserCategories.useMutation({
    onMutate: async (newCategory) => {
      // Cancel any outgoing refetches
      await queryClient.auth.getUserCategories.cancel();

      // Snapshot the previous value
      const previousCategories = queryClient.auth.getUserCategories.getData();

      // Optimistically update to the new value
      queryClient.auth.getUserCategories.setData(undefined, (old) => {
        if (newCategory.isInterested) {
          return [...(old ?? []), newCategory.categoryId];
        } else {
          return (old ?? []).filter((id) => id !== newCategory.categoryId);
        }
      });

      // Return a context object with the snapshotted value
      return { previousCategories };
    },
    onError: (err, newCategory, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.auth.getUserCategories.setData(
        undefined,
        context?.previousCategories,
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data consistency
      queryClient.auth.getUserCategories.invalidate();
    },
  });

  const handleCategoryToggle = (categoryId: number, isInterested: boolean) => {
    updateUserCategory.mutate({ categoryId, isInterested });
  };

  if (isLoading) return <div>Loading...</div>;

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
