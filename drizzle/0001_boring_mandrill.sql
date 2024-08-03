CREATE TABLE IF NOT EXISTS "roc8-asssignment_otps" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" text NOT NULL,
	"password" varchar(255) NOT NULL,
	"otp" varchar(6) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp DEFAULT NOW() + INTERVAL '5 minutes' NOT NULL,
	CONSTRAINT "roc8-asssignment_otps_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "roc8-asssignment_otps_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "roc8-asssignment_user_categories" DROP CONSTRAINT "roc8-asssignment_user_categories_user_id_roc8-asssignment_users_id_fk";
--> statement-breakpoint
ALTER TABLE "roc8-asssignment_users" ADD COLUMN "user_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roc8-asssignment_user_categories" ADD CONSTRAINT "roc8-asssignment_user_categories_user_id_roc8-asssignment_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."roc8-asssignment_users"("user_id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "roc8-asssignment_users" DROP COLUMN IF EXISTS "id";