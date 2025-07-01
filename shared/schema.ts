import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("employee"), // employee or admin
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  capacity: serial("capacity").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  roomId: serial("room_id").notNull(),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  startTime: varchar("start_time").notNull(), // HH:MM format
  endTime: varchar("end_time").notNull(), // HH:MM format
  purpose: text("purpose").notNull(),
  bookingType: varchar("booking_type").notNull(), // personal or team
  team: varchar("team"),
  status: varchar("status").notNull().default("confirmed"), // confirmed, pending, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const priorityRequests = pgTable("priority_requests", {
  id: serial("id").primaryKey(),
  requesterId: varchar("requester_id").notNull(),
  conflictBookingId: serial("conflict_booking_id").notNull(),
  reason: text("reason").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  reviewedBy: varchar("reviewed_by"), // admin who reviewed
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin notifications table
export const adminNotifications = pgTable("admin_notifications", {
  id: serial("id").primaryKey(),
  type: varchar("type").notNull(), // "priority_request", "new_user", etc.
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  relatedId: integer("related_id"), // ID of related entity (priority request, user, etc.)
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertRoom = typeof rooms.$inferInsert;
export type Room = typeof rooms.$inferSelect;

export type InsertBooking = typeof bookings.$inferInsert;
export type Booking = typeof bookings.$inferSelect;

export type InsertPriorityRequest = typeof priorityRequests.$inferInsert;
export type PriorityRequest = typeof priorityRequests.$inferSelect;

export type InsertTeam = typeof teams.$inferInsert;
export type Team = typeof teams.$inferSelect;

export type InsertAdminNotification = typeof adminNotifications.$inferInsert;
export type AdminNotification = typeof adminNotifications.$inferSelect;

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertPriorityRequestSchema = createInsertSchema(priorityRequests).omit({
  id: true,
  createdAt: true,
});
