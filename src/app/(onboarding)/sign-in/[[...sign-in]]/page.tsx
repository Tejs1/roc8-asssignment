"use client";

import { api } from "@/trpc/react";
import * as React from "react";
import Link from "next/link";

import { useRouter } from "next/navigation";
import { z } from "zod";

import { constraints } from "@/lib/utils";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserAuthForm() {
  const login = api.auth.login.useMutation();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isFormValid, setIsFormValid] = React.useState<boolean>(false);
  const router = useRouter();
  const formRef = React.useRef<HTMLFormElement>(null);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();

    // if (!isLoaded) {
    //   return;
    // }
    const form = event.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      return;
    }
    const formData = new FormData(form);
    const emailAddress = formData.get("email") as string;
    const password = formData.get("password") as string;

    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    });

    const parse = schema.safeParse({
      email: emailAddress,
      password: password,
    });

    if (!parse.success) {
      throw new Error("Invalid form data");
    }

    try {
      const result = await login.mutateAsync({ emailAddress, password });
      // Store the token and redirect to protected page
      console.log(result);
      // window.location.href = "/categories";
      localStorage.setItem("token", result.token);
      router.push("/categories");
    } catch (err) {
      console.error("error", err);
    }
  }

  function validateForm(e: React.ChangeEvent<HTMLInputElement>) {
    if (formRef.current) {
      if (e && constraints.hasOwnProperty(e.target.id)) {
        const input = e.target as HTMLInputElement;
        type InputType = keyof typeof constraints;
        const type: string = input.id;

        const constraintEmail = new RegExp(
          constraints[type as InputType][0] ?? "",
          "",
        );
        if (constraintEmail.test(input.value)) {
          input.setCustomValidity("");
        } else {
          input.setCustomValidity(constraints[type as InputType][1] ?? "");
        }
      }
      setIsFormValid(formRef.current.checkValidity());
    }
  }

  return (
    <main className="flex h-full flex-grow flex-col items-center">
      <div className="m-auto grid w-[400px] gap-6 rounded-3xl border p-10">
        <div className="flex flex-col items-center justify-start">
          <h1 className="text-[32px] font-semibold">Login</h1>
          <h2 className="text-2xl">
            <span className="text-accent-foreground">Welcome back to </span>{" "}
            Nuecomm
          </h2>
          <span className="text-muted-foreground">
            The next gen business marketplace
          </span>
        </div>

        <form ref={formRef} onSubmit={onSubmit}>
          <div className="grid gap-2">
            <div className="grid gap-8">
              <Label htmlFor="email">
                Email{" "}
                <Input
                  onChange={(e) => validateForm(e)}
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  disabled={isLoading}
                  className="mt-2"
                  required
                />
              </Label>

              <Label htmlFor="password">
                Password{" "}
                <Input
                  onChange={(e) => validateForm(e)}
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  autoCapitalize="none"
                  autoComplete="password"
                  autoCorrect="off"
                  disabled={isLoading}
                  className="mt-2"
                  required
                />
              </Label>
              <Button
                disabled={isLoading}
                className="font-bold uppercase"
                value="Validate"
                type="submit"
              >
                {isLoading && (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                )}
                Log In
              </Button>
            </div>
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
