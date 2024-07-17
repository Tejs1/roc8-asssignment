import { categories, users, usersToCategories } from "@/server/db/schema";
import { db } from "@/server/db";
import { seedCategories } from "./seedCategories";
import { conn } from "@/server/db";
async function clearDatabase() {
  await db.delete(usersToCategories).execute();
  await db.delete(users).execute();
  await db.delete(categories).execute();
}

async function insertSeedData() {
  await db.insert(users).values([
    { name: "Alice", email: "Alice@nyc.com" },
    { name: "Bob", email: "Bob@nyc.com" },
    { name: "Charlie", email: "Charlie@nyc.com" },
  ]);
  await db.insert(categories).values(seedCategories.map((name) => ({ name })));
}

export async function seed() {
  if (process.env.NODE_ENV === "production") {
    console.error("Attempted to run seed script in production!");
    process.exit(1);
  }

  try {
    console.log("Starting database seeding...");
    await db.transaction(async (transactionDb) => {
      await clearDatabase();
      await insertSeedData();
    });
    console.log("Database seeding completed successfully.");
  } catch (err) {
    console.error("Error during database seeding:", err);
    process.exit(1);
  } finally {
    // Assuming `db` has a `close` method to terminate the connection.
    await conn.end();
    console.log("Database connection closed.");
    // Explicitly exit the process to ensure the program ends.
    process.exit(0);
  }
}

seed().catch((err) => {
  console.error("Unhandled error in seed script:", err);
  process.exit(1);
});
