"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { cn, constraints } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getToken } from "@/lib/utils";
const initialState = {
  email: "",
  password: "",
};
interface SignInFormValues {
  email: string;
  password: string;
}
type SignInOptions = {
  searchParams: {
    [key: string]: string;
  };
};
export default function SignIn({ searchParams }: SignInOptions) {
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<SignInFormValues>({
    mode: "onChange",
    defaultValues: initialState,
  });
  const login = api.auth.login.useMutation();
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const onSubmit: SubmitHandler<SignInFormValues> = async (data) => {
    setIsLoading(true);
    try {
      const result = await login.mutateAsync({
        ...data,
        emailAddress: data.email,
      });
      if (result.success) {
        localStorage.setItem("token", result.token ?? "");
        router.push("/categories");
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    const token = getToken();
    if (token) {
      router.push("/categories");
    }
  }, [router]);
  return (
    <main className="flex h-full flex-grow flex-col items-center justify-center">
      <div className="m-auto grid w-[400px] gap-6 rounded-3xl border p-10">
        <div className="flex flex-col items-center justify-start">
          <h1 className="text-[32px] font-semibold">Login</h1>
          {searchParams.redirect === "categories" ? (
            <>
              <h2 className="text-2xl">
                <span className="text-accent-foreground">
                  Sign in to continue
                </span>
              </h2>
              <span className="text-muted-foreground">
                and mark your interests!
              </span>
            </>
          ) : (
            <>
              <h2 className="text-2xl">
                <span className="text-accent-foreground">Welcome back to </span>
                Nuecomm
              </h2>
              <span className="text-muted-foreground">
                The next gen business marketplace
              </span>
            </>
          )}
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1">
            <div>
              <Label htmlFor="email">
                <span className="ml-1">Email</span>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: new RegExp(constraints.email[0]),
                      message: constraints.email[1],
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="email"
                      placeholder="name@example.com"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      disabled={isLoading}
                      className="mt-1"
                    />
                  )}
                />
              </Label>
              <div className="mt-1 min-h-5">
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="password">
                <span className="ml-1">Password</span>
                <Controller
                  name="password"
                  control={control}
                  rules={{
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    pattern: {
                      value: new RegExp(constraints.password[0]),
                      message: constraints.password[1],
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      autoCapitalize="none"
                      autoComplete="new-password"
                      autoCorrect="off"
                      disabled={isLoading}
                      className="mt-1"
                    />
                  )}
                />
              </Label>
              <div className="mt-1 min-h-5">
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            <Button
              aria-disabled={isLoading}
              className="font-bold uppercase"
              type="submit"
              disabled={!isValid || isLoading}
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Log In
            </Button>
          </div>
        </form>

        <div className="relative flex justify-center pt-[38px] text-sm">
          <span className="bg-background px-2 text-accent-foreground">
            Don&apos;t have an Account?{" "}
            <Link href="sign-up" className="m-1 font-bold uppercase">
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </main>
  );
}
