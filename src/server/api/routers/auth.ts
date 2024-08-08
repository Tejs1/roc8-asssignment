import { z } from "zod";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/server/api/middleware";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { categories, users, userCategories, otps } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { sendOtp, signAuth, testOtp } from "@/lib/auth";
import { and, sql } from "drizzle-orm/sql";
import { generateOtp } from "@/lib/utils";

export const authRouter = createTRPCRouter({
  signup: publicProcedure
    .input(
      z.object({
        emailAddress: z.string().email(),
        password: z.string().min(8),
        name: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { emailAddress, password, name } = input;
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword, "hashed password");
      const existingUser = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, emailAddress))
        .limit(1);

      if (existingUser[0]) {
        return {
          success: false,
          message: "Email already exists",
          code: "EMAIL_EXISTS_VERIFIED",
          userId: null,
        };
      }

      const otp = generateOtp();

      const tempUser = await ctx.db
        .insert(otps)
        .values({ email: emailAddress, password: hashedPassword, name, otp })
        .onConflictDoUpdate({
          target: [otps.email],
          set: {
            password,
            otp,
            name,
            expiresAt: sql`NOW() + INTERVAL '5 minutes'`,
            createdAt: sql`NOW()`,
          },
        })
        .returning();

      console.log("otp inserted");
      await sendOtp(emailAddress, otp);
      if (tempUser[0]) {
        return {
          success: true,
          message: "OTP sent to your email. Please verify to complete login.",
          code: "OTP_SENT",
          userId: tempUser[0].userId,
        };
      }
      return {
        success: false,
        message: "Something went wrong. Please try again.",
        code: "INTERNAL_SERVER_ERROR",
        userId: null,
      };
    }),
  verifyOtp: publicProcedure
    .input(z.object({ userId: z.string(), otp: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId, otp } = input;
      const otpData = await ctx.db
        .select()
        .from(otps)
        .where(and(eq(otps.userId, userId), eq(otps.otp, otp)))
        .limit(1);
      if (otpData[0]) {
        const currentTime = new Date();
        const expiresAt = new Date(otpData[0].expiresAt);

        if (currentTime > expiresAt) {
          const newOtp = generateOtp();
          await ctx.db
            .update(otps)
            .set({
              otp: newOtp,
              createdAt: sql`NOW()`,
              expiresAt: sql`NOW() + INTERVAL '5 minutes'`,
            })
            .where(eq(otps.userId, userId))
            .execute();
          return {
            success: false,
            message: "OTP expired. Please try again.",
            code: "OTP_EXPIRED",
          };
        }

        const user = await ctx.db
          .insert(users)
          .values({
            email: otpData[0].email,
            password: otpData[0].password,
            name: otpData[0].name,
          })
          .returning();
        if (user[0]) {
          const token = await signAuth(user[0].id);
          return {
            success: true,
            message: "User created successfully.",
            code: "USER_CREATED",
            token,
            id: userId,
          };
        }
        return {
          success: false,
          message: "Unable to create user. Please try again.",
          code: "INTERNAL_SERVER_ERROR",
        };
      }
      return {
        success: false,
        message: "Invalid OTP. Please try again.",
        code: "INVALID_OTP",
      };
    }),

  login: publicProcedure
    .input(
      z.object({
        emailAddress: z.string().email(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { emailAddress, password } = input;

      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, emailAddress))
        .limit(1);

      if (!user[0] || !(await bcrypt.compare(password, user[0].password))) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const token = await signAuth(user[0].id);

      return {
        success: true,
        token,
        id: user[0].id,
        name: user[0].name,
        email: user[0].email,
      };
    }),

  getUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, ctx.user))
      .limit(1);

    return user[0] ?? null;
  }),
  getCategories: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(6),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const categoriesData = await ctx.db
        .select()
        .from(categories)
        .limit(pageSize)
        .offset(offset);

      const total = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(categories);

      const totalCategories = total[0]?.count ?? 0;
      return {
        categories: categoriesData,
        totalPages: Math.ceil(totalCategories / pageSize),
      };
    }),

  updateUserCategories: protectedProcedure
    .input(
      z.object({
        categoryId: z.number(),
        isInterested: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { categoryId, isInterested } = input;
      const userId = ctx.user;

      await ctx.db
        .insert(userCategories)
        .values({ userId, categoryId, isInterested })
        .onConflictDoUpdate({
          target: [userCategories.userId, userCategories.categoryId],
          set: { isInterested },
        });

      return { success: true };
    }),

  getUserCategories: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user;

    const userCats = await ctx.db
      .select()
      .from(userCategories)
      .where(
        and(
          eq(userCategories.userId, userId),
          eq(userCategories.isInterested, true),
        ),
      );

    return userCats.map(({ categoryId }) => categoryId);
  }),
});
