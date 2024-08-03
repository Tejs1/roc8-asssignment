"use client";

import { useEffect } from "react";
import { redirect, useRouter } from "next/navigation";
import { api } from "@/trpc/react";

import { type props } from "@/lib/utils";
import CategoryList from "./CategoryList";
import CategoryLoading from "@/components/CategoryLoading";
import PaginationComponent from "@/components/PaginationComponent";
import { useAuth } from "@/contexts/AuthContext";

export default function Categories({ searchParams }: props) {
  const router = useRouter();
  const utils = api.useUtils();
  const { user, isLoading: isUserLoading } = useAuth();

  const { page } = searchParams;
  const currentPage = page ? parseInt(page, 10) : 1;

  const { data, isLoading: categoriesLoading } =
    api.auth.getCategories.useQuery(
      { page: currentPage, pageSize: 6 },
      {
        retry: false,
      },
    );

  const { data: userCategories } = api.auth.getUserCategories.useQuery(
    undefined,
    {
      retry: false,
    },
  );

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
    if (!isUserLoading && !user?.id) {
      redirect("/sign-in?redirect=categories");
    }

    if (!isUserLoading && !categoriesLoading && !data) {
      void utils.auth.getUser.reset();
      redirect("/sign-in?redirect=categories&sessionExpired=true");
    }
  }, [
    data,
    isUserLoading,
    user,
    categoriesLoading,
    router,
    utils.auth.getUser,
  ]);

  useEffect(() => {
    if (!page) router.push(`/categories?page=${1}`);
    if (isUserLoading || !user?.id) return;
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
  }, [
    currentPage,
    data,
    utils,
    categoriesLoading,
    router,
    isUserLoading,
    user,
    page,
  ]);

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
              {categoriesLoading || isUserLoading ? (
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
          />
        </div>
      </div>
    </main>
  );
}
