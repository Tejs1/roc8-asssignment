import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "@/env";
import exp from "constants";

const SECRET_KEY = new TextEncoder().encode(env.SECRET_KEY);

export async function signAuth(userId: string): Promise<string> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1h")
    .sign(SECRET_KEY);

  return token;
}

export async function verifyAuth(token: string) {
  const { payload } = await jwtVerify(token, SECRET_KEY);
  return payload as { userId: string };
}

export function setAuthCookie(token: string) {
  cookies().set("authToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });
}

export function clearAuthCookie() {
  cookies().delete("authToken");
}

export function getAuthCookie() {
  return cookies().get("authToken");
}
