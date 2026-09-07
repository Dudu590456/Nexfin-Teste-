CREATE TABLE "ai_history_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"timestamp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"transaction_id" text,
	"name" text NOT NULL,
	"size" text NOT NULL,
	"type" text NOT NULL,
	"url" text NOT NULL,
	"uploaded_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"category" text NOT NULL,
	"limit_amount" double precision NOT NULL,
	"spent_amount" double precision NOT NULL,
	"month" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"amount" double precision NOT NULL,
	"type" text NOT NULL,
	"date" text NOT NULL,
	"status" text NOT NULL,
	"is_recurring" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"limit" double precision NOT NULL,
	"current_spent" double precision NOT NULL,
	"color" text NOT NULL,
	"expiry" text NOT NULL,
	"last_four" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"file_url" text NOT NULL,
	"generated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "financial_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"score" integer NOT NULL,
	"organization" integer NOT NULL,
	"control" integer NOT NULL,
	"savings" integer NOT NULL,
	"reserve" integer NOT NULL,
	"goals" integer NOT NULL,
	"punctuality" integer NOT NULL,
	"suggestions" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"target_amount" double precision NOT NULL,
	"current_amount" double precision NOT NULL,
	"category" text NOT NULL,
	"deadline" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"description" text NOT NULL,
	"total_amount" double precision NOT NULL,
	"installments_count" integer NOT NULL,
	"installment_amount" double precision NOT NULL,
	"current_installment" integer NOT NULL,
	"category" text NOT NULL,
	"first_due_date" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "investments" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"amount" double precision NOT NULL,
	"yield_rate" text NOT NULL,
	"date" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"date" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"amount" double precision NOT NULL,
	"description" text NOT NULL,
	"date" text NOT NULL,
	"card_id" text,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"cpf" text NOT NULL,
	"avatar" text NOT NULL,
	"theme" text DEFAULT 'dark' NOT NULL,
	"language" text DEFAULT 'pt' NOT NULL,
	"notifications_enabled" boolean DEFAULT true NOT NULL,
	"ai_grounding" boolean DEFAULT true NOT NULL,
	"realtime_sync" boolean DEFAULT true NOT NULL,
	CONSTRAINT "user_profiles_email_unique" UNIQUE("email")
);
