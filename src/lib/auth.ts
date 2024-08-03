"use server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "@/env";
import nodemailer from "nodemailer";

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

export async function sendOtp(email: string, otp: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
}

export async function testOtp(email: string, otp: string): Promise<void> {
  try {
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        console.error("Failed to create a testing account. " + err.message);
        return process.exit(1);
      }

      let transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
      let message = {
        from: account.user,
        to: email,
        subject: "Nodemailer is unicode friendly ✔",
        text: "Hello to myself!",
        html: `<h1>${otp}</h1>`,
      };
      transporter.sendMail(message, (err, info) => {
        if (err) {
          console.log("Error occurred. " + err.message);
          return process.exit(1);
        }
      });
    });
  } catch (error) {
    console.log("error", error);
  }
}
