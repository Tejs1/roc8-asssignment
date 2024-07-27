"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

import { type props } from "@/lib/utils";
import CategoryList from "./CategoryList";
import CategoryLoading from "@/components/CategoryLoading";
import PaginationComponent from "@/components/PaginationComponent";
import { useAuth } from "@/contexts/AuthContext";

export default function Categories({ searchParams }: props) {
  const router = useRouter();
  const { user } = useAuth();

  const { page } = searchParams;
  const [currentPage, setCurrentPage] = useState(page ? parseInt(page) : 1);
  const utils = api.useUtils();

  const { data, isLoading: categoriesLoading } =
    api.auth.getCategories.useQuery({ page: currentPage, pageSize: 6 });

  const { data: userCategories } = api.auth.getUserCategories.useQuery();

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
    if (!user.id) {
      router.push("/sign-in?redirect=categories");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (!categoriesLoading && data === undefined) {
      localStorage.removeItem("token");
      router.push("/sign-in?redirect=categories&sessionExpired=true");
    }
  }, [categoriesLoading, data, router]);

  useEffect(() => {
    router.push(`/categories?page=${currentPage}`);
    if (!categoriesLoading && data && currentPage < data.totalPages) {
      void utils.auth.getCategories.prefetch({
        page: currentPage + 1,
        pageSize: 6,
      });
    }
    if (!categoriesLoading && data && currentPage + 1 < data.totalPages) {
      void utils.auth.getCategories.prefetch({
        page: currentPage + 2,
        pageSize: 6,
      });
    }
  }, [currentPage, data, utils, categoriesLoading, router]);

  useEffect(() => {
    page === undefined && setCurrentPage(1);
  }, [page]);

  if (!user.id) {
    return null;
  }

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
            totalPages={data?.totalPages ?? 1}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </main>
  );
}
