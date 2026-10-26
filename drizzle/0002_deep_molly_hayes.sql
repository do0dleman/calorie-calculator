ALTER TABLE "meal" ADD COLUMN "user_id" text;
--> statement-breakpoint
UPDATE "meal" SET "user_id" = "id";
--> statement-breakpoint
ALTER TABLE "meal" ALTER COLUMN "user_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "meal" DROP CONSTRAINT "meal_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "meal" ADD PRIMARY KEY ("id");
--> statement-breakpoint
ALTER TABLE "meal" ADD CONSTRAINT "meal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
