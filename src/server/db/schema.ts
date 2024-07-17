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
  primaryKey,
} from "drizzle-orm/pg-core";

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
  email: varchar("email", { length: 256 }).notNull(),
});

export const categories = createTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const usersToCategories = createTable(
  "users_to_categories",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
  },
  (table) => ({
    pk: primaryKey({
      name: "users_categories",
      columns: [table.userId, table.categoryId],
    }),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  categories: many(usersToCategories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  users: many(usersToCategories),
}));

export const usersToCategoriesRelations = relations(
  usersToCategories,
  ({ one }) => ({
    user: one(users, {
      fields: [usersToCategories.userId],
      references: [users.id],
    }),
    category: one(categories, {
      fields: [usersToCategories.categoryId],
      references: [categories.id],
    }),
  }),
);
