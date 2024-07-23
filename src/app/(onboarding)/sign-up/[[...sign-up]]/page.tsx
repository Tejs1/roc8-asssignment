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

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}
const initialState = {
  name: "",
  message: "",
  email: "",
};

export default function SignUp() {
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    mode: "onChange",
    defaultValues: initialState,
  });
  const signup = api.auth.signup.useMutation();
  const router = useRouter();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    setIsLoading(true);
    try {
      const result = await signup.mutateAsync({
        ...data,
        emailAddress: data.email,
        name: data.name.trim(),
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

  return (
    <main className="flex h-full flex-grow flex-col items-center justify-center">
      <div className="m-auto grid w-[400px] gap-6 rounded-3xl border p-10">
        <h1 className="text-[32px] font-semibold">Create your account</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-1">
            <div>
              {" "}
              <Label htmlFor="name">
                <span className="ml-1">Name</span>

                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: "Name is required",
                    validate: (value) =>
                      value.trim().length > 0 || "Name cannot be empty spaces",
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="name"
                      placeholder="John Doe"
                      autoCapitalize="words"
                      autoComplete="name"
                      autoCorrect="off"
                      disabled={isLoading}
                      className="mt-1"
                    />
                  )}
                />
              </Label>{" "}
              <div className="mt-1 min-h-5">
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>
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
              Create Account
            </Button>
          </div>
        </form>

        <div className="relative flex justify-center text-sm">
          <span className="bg-background px-2 text-accent-foreground">
            Have an account?{" "}
            <Link href="/sign-in" className="m-1 font-bold uppercase">
              Log In
            </Link>
          </span>
        </div>
      </div>
    </main>
  );
}
