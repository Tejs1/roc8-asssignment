"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { cn, constraints } from "@/lib/utils";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = {
  message: "",
  email: "",
};

export default function SignUp() {
  const signup = api.auth.signup.useMutation();
  const [name, setName] = React.useState("");
  const router = useRouter();

  const [pendingVerification, setPendingVerification] = React.useState(false);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isFormValid, setIsFormValid] = React.useState<boolean>(false);

  const { pending } = useFormStatus();

  const formRef = React.useRef<HTMLFormElement>(null);

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!form.checkValidity()) {
      return;
    }

    setIsLoading(true);
    //get input values
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    setName(name);

    const emailAddress = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signup.mutateAsync({
        emailAddress,
        password,
        name,
      });
      // Store the token and redirect to protected page
      console.log(result);
      localStorage.setItem("token", result.token);
      router.push("/categories");
      // change the UI to our pending section.
      setIsLoading(false);
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
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
    <main className="flex h-full flex-grow flex-col items-center justify-center">
      {!pendingVerification && (
        <div className="m-auto grid w-[400px] gap-6 rounded-3xl border p-10">
          <h1 className="text-[32px] font-semibold">Create your account</h1>
          <form ref={formRef} onSubmit={onSubmit}>
            <div className="grid gap-2">
              <div className="grid gap-8">
                <Label htmlFor="name">
                  Name{" "}
                  <Input
                    onChange={(e) => validateForm(e)}
                    id="name"
                    type="name"
                    name="name"
                    placeholder="John Doe"
                    autoCapitalize="words"
                    autoComplete="name"
                    autoCorrect="off"
                    disabled={isLoading}
                    className="mt-2"
                    required
                  />
                </Label>

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
                    placeholder="Create a strong password"
                    autoCapitalize="none"
                    autoComplete="password"
                    autoCorrect="off"
                    disabled={isLoading}
                    className="mt-2"
                    required
                  />
                </Label>
                <Button
                  aria-disabled={isLoading}
                  className="font-bold uppercase"
                  value="Validate"
                  type="submit"
                >
                  {pending && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Account
                </Button>
              </div>
            </div>
          </form>

          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-accent-foreground">
              Have an account?{" "}
              <Link href="sign-in" className="m-1 font-bold uppercase">
                Log In
              </Link>
            </span>
          </div>
        </div>
      )}
    </main>
  );
}
