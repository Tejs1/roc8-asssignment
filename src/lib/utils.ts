import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export type Constraints = {
  email: [string, string];
  password: [string, string];
};
export const constraints: Constraints = {
  email: [
    "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
    "Invalid email address",
  ],
  password: [
    "^(?=.*[A-Za-z])(?=.*\\d).{8,}$",
    "At least one letter and one number",
  ],
};

export const getToken = () =>
  localStorage !== undefined ? localStorage.getItem("token") : null;

export type props = {
  params: Record<string, string>;
  searchParams: Record<string, string>;
};

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}
