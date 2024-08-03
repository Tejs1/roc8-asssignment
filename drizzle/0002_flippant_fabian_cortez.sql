ALTER TABLE "roc8-asssignment_users" RENAME COLUMN "user_id" TO "id";--> statement-breakpoint
ALTER TABLE "roc8-asssignment_user_categories" DROP CONSTRAINT "roc8-asssignment_user_categories_user_id_roc8-asssignment_users_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "roc8-asssignment_user_categories" ADD CONSTRAINT "roc8-asssignment_user_categories_user_id_roc8-asssignment_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."roc8-asssignment_users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
