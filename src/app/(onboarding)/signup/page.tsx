"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(1);

  const signup = api.auth.signup.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      const result = await signup.mutateAsync({
        email,
        password,
        name: "John Doe",
      });
      // Store the token and redirect to protected page
      console.log(result);
      localStorage.setItem("token", result.token);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {step === 1 ? (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <button type="submit">Next</button>
        </>
      ) : (
        <>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Sign Up</button>
        </>
      )}
    </form>
  );
}
