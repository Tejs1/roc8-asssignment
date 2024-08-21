// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql, relations } from "drizzle-orm";
import {
  index,
  pgTableCreator,
  serial,
  timestamp,
  uuid,
  text,
  varchar,
  integer,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
// import crypto from "crypto";
// const uuid = crypto.randomUUID();
/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `roc8-asssignment_${name}`);

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const users = createTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const otps = createTable("otps", {
  userId: uuid("user_id").notNull().defaultRandom().unique().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name").notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  otp: varchar("otp", { length: 8 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at")
    .default(sql`NOW() + INTERVAL '5 minutes'`)
    .notNull(),
});

export const categories = createTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const userCategories = createTable(
  "user_categories",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    isInterested: boolean("is_interested").default(false),
  },
  (table) => {
    return {
      userCategoryUnique: uniqueIndex("user_category_unique").on(
        table.userId,
        table.categoryId,
      ),
    };
  },
);
export const usersRelations = relations(users, ({ many }) => ({
  categories: many(userCategories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  users: many(userCategories),
}));

export const usersToCategoriesRelations = relations(
  userCategories,
  ({ one }) => ({
    user: one(users, {
      fields: [userCategories.userId],
      references: [users.id],
    }),
    category: one(categories, {
      fields: [userCategories.categoryId],
      references: [categories.id],
    }),
  }),
);
