import { pgTable, text, integer, timestamp, boolean, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

// Users table
export const users = pgTable('Users', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  studentId: text('student_id'),
  phone: text('phone'),
  avatar: text('avatar'),
  department: text('department'),
  grade: text('grade'),
  isVerified: boolean('is_verified').default(false).notNull(),
  creditScore: integer('credit_score').default(100).notNull(),
  completedDeals: integer('completed_deals').default(0).notNull(),
  positiveRate: decimal('positive_rate', { precision: 5, scale: 2 }).default('100').notNull(),
  role: text('role').default('user').notNull(), // 'user' | 'admin'
  isBanned: boolean('is_banned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Products table
export const products = pgTable('Products', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  sellerId: text('seller_id').notNull().references(() => users.id),
  title: text('title').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }),
  category: text('category').notNull(), // books|electronics|daily|sports|clothing
  condition: text('condition').notNull(), // new|99|80|flaw
  location: text('location').notNull(),
  images: text('images').array().default([]).notNull(),
  status: text('status').default('pending').notNull(), // pending|approved|rejected|sold|expired
  isUrgent: boolean('is_urgent').default(false).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  isGraduationSeason: boolean('is_graduation_season').default(false).notNull(),
  favoriteCount: integer('favorite_count').default(0).notNull(),
  viewCount: integer('view_count').default(0).notNull(),
  isbn: text('isbn'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('Messages', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  senderId: text('sender_id').notNull().references(() => users.id),
  receiverId: text('receiver_id').notNull().references(() => users.id),
  productId: text('product_id').references(() => products.id),
  content: text('content').notNull(),
  messageType: text('message_type').default('text').notNull(), // text|image|system
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Orders table
export const orders = pgTable('Orders', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  buyerId: text('buyer_id').notNull().references(() => users.id),
  sellerId: text('seller_id').notNull().references(() => users.id),
  productId: text('product_id').notNull().references(() => products.id),
  status: text('status').default('intent').notNull(), // intent|completed|cancelled
  buyerRating: integer('buyer_rating'), // 1=positive 2=neutral 3=negative
  buyerComment: text('buyer_comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

// Favorites table
export const favorites = pgTable('Favorites', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  userId: text('user_id').notNull().references(() => users.id),
  productId: text('product_id').notNull().references(() => products.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reports table
export const reports = pgTable('Reports', {
  id: text('id').primaryKey().default('gen_random_uuid()'),
  reporterId: text('reporter_id').notNull().references(() => users.id),
  targetType: text('target_type').notNull(), // product|user|message
  targetId: text('target_id').notNull(),
  reason: text('reason').notNull(),
  description: text('description'),
  status: text('status').default('pending').notNull(), // pending|resolved|dismissed
  adminNote: text('admin_note'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const insertProductSchema = createInsertSchema(products, {
  title: z.string().min(1).max(50),
  price: z.coerce.string(),
  originalPrice: z.coerce.string().optional(),
});

export const insertMessageSchema = createInsertSchema(messages, {
  content: z.string().min(1),
});

export const insertOrderSchema = createInsertSchema(orders);
export const insertFavoriteSchema = createInsertSchema(favorites);
export const insertReportSchema = createInsertSchema(reports, {
  reason: z.string().min(1),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
