"use client";

import { useState, useEffect } from "react";
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
  const updateUserCategory = api.auth.updateUserCategories.useMutation({
    onSuccess: () => {
      refetchUserCategories();
    },
  });

  const handleCategoryToggle = async (
    categoryId: number,
    isInterested: boolean,
  ) => {
    await updateUserCategory.mutateAsync({ categoryId, isInterested });
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
