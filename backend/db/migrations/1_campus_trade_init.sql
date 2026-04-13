-- Campus Trade Platform Migration

CREATE TABLE IF NOT EXISTS "Users" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "password" text NOT NULL,
  "student_id" text,
  "phone" text,
  "avatar" text,
  "department" text,
  "grade" text,
  "is_verified" boolean NOT NULL DEFAULT false,
  "credit_score" integer NOT NULL DEFAULT 100,
  "completed_deals" integer NOT NULL DEFAULT 0,
  "positive_rate" decimal(5,2) NOT NULL DEFAULT 100,
  "role" text NOT NULL DEFAULT 'user',
  "is_banned" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Products" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "seller_id" text NOT NULL REFERENCES "Users"("id"),
  "title" text NOT NULL,
  "description" text,
  "price" decimal(10,2) NOT NULL,
  "original_price" decimal(10,2),
  "category" text NOT NULL,
  "condition" text NOT NULL,
  "location" text NOT NULL,
  "images" text[] NOT NULL DEFAULT '{}',
  "status" text NOT NULL DEFAULT 'pending',
  "is_urgent" boolean NOT NULL DEFAULT false,
  "is_featured" boolean NOT NULL DEFAULT false,
  "is_graduation_season" boolean NOT NULL DEFAULT false,
  "favorite_count" integer NOT NULL DEFAULT 0,
  "view_count" integer NOT NULL DEFAULT 0,
  "isbn" text,
  "expires_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Messages" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "sender_id" text NOT NULL REFERENCES "Users"("id"),
  "receiver_id" text NOT NULL REFERENCES "Users"("id"),
  "product_id" text REFERENCES "Products"("id"),
  "content" text NOT NULL,
  "message_type" text NOT NULL DEFAULT 'text',
  "is_read" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Orders" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "buyer_id" text NOT NULL REFERENCES "Users"("id"),
  "seller_id" text NOT NULL REFERENCES "Users"("id"),
  "product_id" text NOT NULL REFERENCES "Products"("id"),
  "status" text NOT NULL DEFAULT 'intent',
  "buyer_rating" integer,
  "buyer_comment" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "completed_at" timestamp
);

CREATE TABLE IF NOT EXISTS "Favorites" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "user_id" text NOT NULL REFERENCES "Users"("id"),
  "product_id" text NOT NULL REFERENCES "Products"("id"),
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Reports" (
  "id" text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "reporter_id" text NOT NULL REFERENCES "Users"("id"),
  "target_type" text NOT NULL,
  "target_id" text NOT NULL,
  "reason" text NOT NULL,
  "description" text,
  "status" text NOT NULL DEFAULT 'pending',
  "admin_note" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "resolved_at" timestamp
);
