import { z } from "zod";
import bcrypt from "bcrypt";
import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "@/server/api/middleware";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { categories, users, userCategories } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { signAuth } from "@/lib/auth";
import { and, sql } from "drizzle-orm/sql";

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

      const user = await ctx.db
        .insert(users)
        .values({
          email: emailAddress,
          password: hashedPassword,
          name,
        })
        .returning();

      const token = user[0] ? await signAuth(user[0].id) : null;

      return { success: true, token };
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
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const token = await signAuth(user[0].id);

      return { success: true, token };
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

    console.log(userCats);
    return userCats.map(({ categoryId }) => categoryId);
  }),
});
