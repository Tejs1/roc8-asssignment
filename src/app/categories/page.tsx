"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

import { getToken } from "@/lib/utils";
import CategoryList from "./CategoryList";
import Loading from "./loading";
import CategoryLoading from "@/components/CategoryLoading";
import PaginationComponent from "@/components/PaginationComponent";

export default function Categories() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const utils = api.useUtils();

  const {
    data,
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = api.auth.getCategories.useQuery({ page: currentPage, pageSize: 6 });

  if (!categoriesLoading && data === undefined) {
    localStorage.removeItem("token");
    router.push("/sign-in?redirect=categories");
  }
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
    const token = getToken();
    if (!token) {
      router.push("/sign-in?redirect=categories");
    }
  }, [router]);

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
    if (data && currentPage + 1 < data.totalPages) {
      void utils.auth.getCategories.prefetch({
        page: currentPage + 2,
        pageSize: 6,
      });
    }
  }, [currentPage, data, utils]);

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
            <ul className="h-40 space-y-2">
              {categoriesLoading ? (
                <CategoryLoading />
              ) : (
                <CategoryList
                  categories={data?.categories ?? []}
                  userCategories={userCategories}
                  handleCategoryToggle={handleCategoryToggle}
                />
              )}
            </ul>
          </div>

          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </main>
  );
}
