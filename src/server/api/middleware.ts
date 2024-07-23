import { TRPCError } from "@trpc/server";
import { t } from "./trpc";
import { verifyAuth } from "@/lib/auth";
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  const token = ctx.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  try {
    const verified = await verifyAuth(token);

    return next({
      ctx: {
        ...ctx,
        user: verified.userId,
      },
    });
  } catch (err) {
    console.error("JWT Verification Error:", err);
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
});

export const protectedProcedure = t.procedure.use(authMiddleware);
