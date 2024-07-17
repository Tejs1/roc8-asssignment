import { TRPCError } from "@trpc/server";
import { jwtVerify } from "jose";
import { t } from "./trpc";
import { env } from "@/env";
const SECRET_KEY = new TextEncoder().encode(env.SECRET_KEY);
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const token = await ctx.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  try {
    const verified = await jwtVerify(token, SECRET_KEY);

    return next({
      ctx: {
        ...ctx,
        user: verified.payload as { userId: string },
      },
    });
  } catch (err) {
    console.error("JWT Verification Error:", err);
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
});

export const protectedProcedure = t.procedure.use(authMiddleware);
