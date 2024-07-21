"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Checkbox } from "@/components/ui/checkbox";

export default function Categories() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const utils = api.useUtils();

  const {
    data,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = api.auth.getCategories.useQuery({ page: currentPage, pageSize: 6 });

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
      void utils.auth.getUserCategories.setData(
        undefined,
        context?.previousCategories,
      );
    },
    onSettled: () => {
      void utils.auth.getUserCategories.invalidate();
    },
  });

  const handleCategoryToggle = (
    categoryId: number,
    isInterested: boolean | "indeterminate",
  ) => {
    if (typeof isInterested === "string") return;
    void updateUserCategory.mutate({ categoryId, isInterested });
  };
  useEffect(() => {
    setTotalPages(data?.totalPages ?? 1);
  }, [data]);
  useEffect(() => {
    if (data && currentPage < data.totalPages) {
      void utils.auth.getCategories.prefetch({
        page: currentPage + 1,
        pageSize: 6,
      });
    }
  }, [currentPage, data, utils]);
  if (userCategoriesLoading) return <div>Loading...</div>;

  return (
    <main className="flex h-full flex-grow flex-col items-center">
      <div className="m-auto grid gap-6 rounded-3xl border p-10">
        <div className="flex flex-col items-center justify-start">
          <h1 className="text-[32px] font-semibold">
            Please mark your interests!
          </h1>
          <h2 className="text-lg text-muted-foreground">
            We will keep you notified.
          </h2>
        </div>
        <div>
          <div className="space-y-2">
            <div className="mb-4">
              <label
                className="text-base font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                htmlFor=":rbq:-form-item"
              >
                My saved interests!
              </label>
            </div>
            <ul className="space-y-2">
              {data?.categories.map((category) => (
                <li
                  key={category.id}
                  className="flex flex-row items-start space-x-3 space-y-0"
                >
                  <Checkbox
                    id={category.id.toString()}
                    checked={userCategories?.includes(category.id)}
                    onCheckedChange={(isChecked) =>
                      handleCategoryToggle(category.id, isChecked)
                    }
                  />

                  <label
                    htmlFor={category.id.toString()}
                    className="text-sm font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <nav>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    disabled={currentPage <= 1}
                    aria-disabled={currentPage <= 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  />
                </PaginationItem>

                <PaginationItem>
                  <PaginationLink onClick={() => setCurrentPage(currentPage)}>
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    disabled={currentPage >= totalPages}
                    aria-disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </nav>
        </div>
      </div>
    </main>
  );
}
