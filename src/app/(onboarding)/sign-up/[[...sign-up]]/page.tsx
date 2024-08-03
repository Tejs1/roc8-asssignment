"use client";

import * as React from "react";
import { redirect, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { constraints } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

interface SignUpFormData {
  name: string;
  email: string;
  password: string;
}
interface OtpFormData {
  confirmOtp: string;
}
const initialState = {
  name: "",
  message: "",
  email: "",
};

export default function SignUp() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [userId, setUserId] = React.useState("");
  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    mode: "onChange",
    defaultValues: initialState,
  });
  // otp form
  const {
    handleSubmit: handleSubmitOtp,
    control: controlOtp,
    formState: { errors: errorsOtp, isValid: isValidOtp },
  } = useForm<OtpFormData>({
    mode: "onChange",
    defaultValues: { confirmOtp: "" },
  });
  const utils = api.useUtils();
  const { user, isLoading: isUserLoading } = useAuth();
  const signup = api.auth.signup.useMutation();
  const verifyOtp = api.auth.verifyOtp.useMutation();

  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    setIsLoading(true);

    const result = await signup.mutateAsync({
      ...data,
      emailAddress: data.email,
      name: data.name.trim(),
    });
    if (!result.success) {
      if (result.code === "EMAIL_EXISTS_VERIFIED") {
        console.log("Email already exists");
        // show error message
        setStep(0);
      }
    }
    if (result.success && result.userId) {
      setUserId(result.userId);
      setStep(2);
    }
    setIsLoading(false);
  };

  const onSubmitOtp: SubmitHandler<OtpFormData> = async (data) => {
    setIsLoading(true);
    try {
      const result = await verifyOtp.mutateAsync({
        otp: data.confirmOtp,
        userId: userId,
      });
      if (result.success) {
        localStorage.setItem("token", result.token ?? "");
        setStep(3);
        void utils.auth.getUser.invalidate();
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setIsLoading(false);
    }
  };
  React.useEffect(() => {
    if (step === 3) {
      redirect("/categories");
    }
  }, [step]);

  React.useEffect(() => {
    if (step === 3) redirect("/categories");
    if (step === 0) redirect("/sign-in");
  }, [step]);

  // React.useEffect(() => {
  //   if (user?.id && !isUserLoading) {
  //     void utils.auth.getUser.refetch();
  //     if (user?.id && !isUserLoading) {
  //       redirect("/categories");
  //     }
  //   }
  // }, [user, isUserLoading, utils.auth.getUser]);
  return (
    <main className="flex h-full flex-grow flex-col items-center justify-center">
      <div className="m-auto grid w-[400px] gap-6 rounded-3xl border p-10">
        {step === 1 && (
          <>
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
                          value.trim().length > 0 ||
                          "Name cannot be empty spaces",
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
          </>
        )}
        {step === 2 && (
          <>
            <h1 className="text-[32px] font-semibold">Verify your Otp code</h1>
            <form onSubmit={handleSubmitOtp(onSubmitOtp)}>
              <div className="grid gap-1">
                <div>
                  <Label htmlFor="otp">
                    <span className="ml-1">Otp</span>
                    <Controller
                      name="confirmOtp"
                      control={controlOtp}
                      rules={{
                        required: "Otp is required",
                        minLength: {
                          value: 6,
                          message: "Otp must be 6 characters",
                        },
                        validate: (value) =>
                          value.trim().length > 0 ||
                          "Otp cannot be empty spaces",
                      }}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="otp"
                          name="confirmOtp"
                          placeholder="123456"
                          autoCapitalize="none"
                          autoComplete="off"
                          autoCorrect="off"
                          disabled={isLoading}
                          className="mt-1"
                          type="number"
                        />
                      )}
                    />
                  </Label>
                  <div className="mt-1 min-h-5">
                    {errorsOtp.confirmOtp && (
                      <p className="text-sm text-destructive">
                        {errorsOtp.confirmOtp.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  aria-disabled={isLoading}
                  className="font-bold uppercase"
                  type="submit"
                  disabled={!isValidOtp || isLoading}
                >
                  {isLoading && (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Verify
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
