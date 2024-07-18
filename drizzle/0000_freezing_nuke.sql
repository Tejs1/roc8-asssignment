CREATE TABLE IF NOT EXISTS "roc8-asssignment_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roc8-asssignment_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roc8-asssignment_user_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" integer NOT NULL,
	"is_interested" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "roc8-asssignment_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "roc8-asssignment_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roc8-asssignment_user_categories" ADD CONSTRAINT "roc8-asssignment_user_categories_user_id_roc8-asssignment_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."roc8-asssignment_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roc8-asssignment_user_categories" ADD CONSTRAINT "roc8-asssignment_user_categories_category_id_roc8-asssignment_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."roc8-asssignment_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "roc8-asssignment_post" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_category_unique" ON "roc8-asssignment_user_categories" ("user_id","category_id");