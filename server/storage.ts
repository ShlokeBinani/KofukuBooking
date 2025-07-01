import {
  users,
  rooms,
  bookings,
  priorityRequests,
  teams,
  adminNotifications,
  type User,
  type UpsertUser,
  type Room,
  type InsertRoom,
  type Booking,
  type InsertBooking,
  type PriorityRequest,
  type InsertPriorityRequest,
  type Team,
  type InsertTeam,
  type AdminNotification,
  type InsertAdminNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Room operations
  getRooms(): Promise<Room[]>;
  initializeRooms(): Promise<void>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  getUserBookings(userId: string): Promise<Booking[]>;
  getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]>;
  checkAvailability(roomId: number, date: string, startTime: string, endTime: string): Promise<boolean>;
  getConflictingBooking(roomId: number, date: string, startTime: string, endTime: string): Promise<Booking | undefined>;
  cancelBooking(bookingId: number, userId: string): Promise<boolean>;
  
  // Priority request operations
  createPriorityRequest(request: InsertPriorityRequest): Promise<PriorityRequest>;
  getPriorityRequests(): Promise<PriorityRequest[]>;
  updatePriorityRequestStatus(requestId: number, status: string): Promise<boolean>;
  
  // Team operations
  getTeams(): Promise<Team[]>;
  initializeTeams(): Promise<void>;
  
  // Admin operations
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<boolean>;
  updateUserStatus(userId: string, isActive: boolean): Promise<boolean>;
  
  // Admin notification operations
  createAdminNotification(notification: InsertAdminNotification): Promise<AdminNotification>;
  getAdminNotifications(): Promise<AdminNotification[]>;
  markNotificationRead(notificationId: number): Promise<boolean>;
  
  // Admin room management
  addRoom(room: InsertRoom): Promise<Room>;
  updateRoom(roomId: number, updates: Partial<Room>): Promise<boolean>;
  removeRoom(roomId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Room operations
  async getRooms(): Promise<Room[]> {
    return await db.select().from(rooms).where(eq(rooms.isActive, true));
  }

  async initializeRooms(): Promise<void> {
    const existingRooms = await db.select().from(rooms);
    if (existingRooms.length === 0) {
      await db.insert(rooms).values([
        { name: "Conference Room 1", capacity: 12 },
        { name: "Cabin 1", capacity: 4 },
      ]);
    }
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId));
  }

  async getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(and(
        gte(bookings.date, startDate),
        lte(bookings.date, endDate)
      ));
  }

  async checkAvailability(roomId: number, date: string, startTime: string, endTime: string): Promise<boolean> {
    const conflictingBookings = await db.select().from(bookings)
      .where(and(
        eq(bookings.roomId, roomId),
        eq(bookings.date, date),
        eq(bookings.status, "confirmed")
      ));

    for (const booking of conflictingBookings) {
      if (this.timeOverlaps(startTime, endTime, booking.startTime, booking.endTime)) {
        return false;
      }
    }
    return true;
  }

  async getConflictingBooking(roomId: number, date: string, startTime: string, endTime: string): Promise<Booking | undefined> {
    const conflictingBookings = await db.select().from(bookings)
      .where(and(
        eq(bookings.roomId, roomId),
        eq(bookings.date, date),
        eq(bookings.status, "confirmed")
      ));

    for (const booking of conflictingBookings) {
      if (this.timeOverlaps(startTime, endTime, booking.startTime, booking.endTime)) {
        return booking;
      }
    }
    return undefined;
  }

  async cancelBooking(bookingId: number, userId: string): Promise<boolean> {
    const result = await db.update(bookings)
      .set({ status: "cancelled" })
      .where(and(
        eq(bookings.id, bookingId),
        eq(bookings.userId, userId)
      ))
      .returning();
    
    return result.length > 0;
  }

  // Priority request operations
  async createPriorityRequest(request: InsertPriorityRequest): Promise<PriorityRequest> {
    const [newRequest] = await db.insert(priorityRequests).values(request).returning();
    return newRequest;
  }

  async getPriorityRequests(): Promise<PriorityRequest[]> {
    return await db.select().from(priorityRequests);
  }

  async updatePriorityRequestStatus(requestId: number, status: string): Promise<boolean> {
    const result = await db.update(priorityRequests)
      .set({ status })
      .where(eq(priorityRequests.id, requestId))
      .returning();
    
    return result.length > 0;
  }

  // Team operations
  async getTeams(): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.isActive, true));
  }

  async initializeTeams(): Promise<void> {
    const existingTeams = await db.select().from(teams);
    if (existingTeams.length === 0) {
      await db.insert(teams).values([
        { name: "Engineering" },
        { name: "Marketing" },
        { name: "Sales" },
        { name: "HR" },
        { name: "Finance" },
      ]);
    }
  }

  private timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
    const start1Minutes = this.timeToMinutes(start1);
    const end1Minutes = this.timeToMinutes(end1);
    const start2Minutes = this.timeToMinutes(start2);
    const end2Minutes = this.timeToMinutes(end2);

    return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Admin operations
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async updateUserRole(userId: string, role: string): Promise<boolean> {
    try {
      await db.update(users).set({ role }).where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
    try {
      await db.update(users).set({ isActive }).where(eq(users.id, userId));
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  }

  // Admin notification operations
  async createAdminNotification(notification: InsertAdminNotification): Promise<AdminNotification> {
    const [created] = await db.insert(adminNotifications).values(notification).returning();
    return created;
  }

  async getAdminNotifications(): Promise<AdminNotification[]> {
    return db.select().from(adminNotifications).orderBy(adminNotifications.createdAt);
  }

  async markNotificationRead(notificationId: number): Promise<boolean> {
    try {
      await db.update(adminNotifications).set({ isRead: true }).where(eq(adminNotifications.id, notificationId));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Admin room management
  async addRoom(room: InsertRoom): Promise<Room> {
    const [created] = await db.insert(rooms).values(room).returning();
    return created;
  }

  async updateRoom(roomId: number, updates: Partial<Room>): Promise<boolean> {
    try {
      await db.update(rooms).set(updates).where(eq(rooms.id, roomId));
      return true;
    } catch (error) {
      console.error('Error updating room:', error);
      return false;
    }
  }

  async removeRoom(roomId: number): Promise<boolean> {
    try {
      await db.update(rooms).set({ isActive: false }).where(eq(rooms.id, roomId));
      return true;
    } catch (error) {
      console.error('Error removing room:', error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
