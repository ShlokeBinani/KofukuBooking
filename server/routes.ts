import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBookingSchema, insertPriorityRequestSchema } from "@shared/schema";
import { sendBookingConfirmation, sendPriorityRequest } from "./services/emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize data
  await storage.initializeRooms();
  await storage.initializeTeams();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Room routes
  app.get('/api/rooms', isAuthenticated, async (req, res) => {
    try {
      const rooms = await storage.getRooms();
      res.json(rooms);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      res.status(500).json({ message: "Failed to fetch rooms" });
    }
  });

  // Team routes
  app.get('/api/teams', isAuthenticated, async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  // Booking routes
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getUserBookings(userId);
      
      // Get room and user details for each booking
      const rooms = await storage.getRooms();
      const roomMap = new Map(rooms.map(room => [room.id, room]));
      
      const enrichedBookings = bookings.map(booking => ({
        ...booking,
        room: roomMap.get(booking.roomId)?.name || 'Unknown Room'
      }));
      
      res.json(enrichedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/bookings/check-availability', isAuthenticated, async (req, res) => {
    try {
      const { roomId, date, startTime, endTime } = req.body;
      
      const isAvailable = await storage.checkAvailability(roomId, date, startTime, endTime);
      
      if (isAvailable) {
        res.json({ available: true });
      } else {
        const conflictingBooking = await storage.getConflictingBooking(roomId, date, startTime, endTime);
        const conflictUser = conflictingBooking ? await storage.getUser(conflictingBooking.userId) : null;
        
        res.json({ 
          available: false, 
          conflict: {
            id: conflictingBooking?.id,
            room: roomId === 1 ? 'Conference Room 1' : 'Cabin 1',
            bookedBy: conflictUser ? `${conflictUser.firstName} ${conflictUser.lastName}` : 'Unknown User',
            startTime: conflictingBooking?.startTime,
            endTime: conflictingBooking?.endTime,
            date: conflictingBooking?.date
          }
        });
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  app.post('/api/bookings/create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = { ...req.body, userId };
      
      // Validate the booking data
      const validatedData = insertBookingSchema.parse(bookingData);
      
      // Double-check availability
      const isAvailable = await storage.checkAvailability(
        validatedData.roomId,
        validatedData.date,
        validatedData.startTime,
        validatedData.endTime
      );
      
      if (!isAvailable) {
        return res.status(409).json({ message: "Room is no longer available" });
      }
      
      const booking = await storage.createBooking(validatedData);
      const user = await storage.getUser(userId);
      const rooms = await storage.getRooms();
      const room = rooms.find(r => r.id === booking.roomId);
      
      // Send confirmation email
      if (user?.email) {
        await sendBookingConfirmation(user.email, {
          userName: `${user.firstName} ${user.lastName}`,
          roomName: room?.name || 'Unknown Room',
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          purpose: booking.purpose
        });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.post('/api/bookings/cancel/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingId = parseInt(req.params.id);
      
      const success = await storage.cancelBooking(bookingId, userId);
      
      if (success) {
        res.json({ message: "Booking cancelled successfully" });
      } else {
        res.status(404).json({ message: "Booking not found or cannot be cancelled" });
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ message: "Failed to cancel booking" });
    }
  });

  // Priority request routes
  app.post('/api/bookings/request-priority', isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.claims.sub;
      const requestData = { ...req.body, requesterId };
      
      const validatedData = insertPriorityRequestSchema.parse(requestData);
      const priorityRequest = await storage.createPriorityRequest(validatedData);
      
      // Get the conflicting booking and its owner
      const conflictingBooking = await storage.getBookings().then(bookings => 
        bookings.find(b => b.id === validatedData.conflictBookingId)
      );
      
      if (conflictingBooking) {
        const conflictOwner = await storage.getUser(conflictingBooking.userId);
        const requester = await storage.getUser(requesterId);
        
        // Send priority request email to department heads
        // For now, we'll send to the room owner - in a real system, this would go to department heads
        if (conflictOwner?.email && requester) {
          await sendPriorityRequest(conflictOwner.email, {
            requesterName: `${requester.firstName} ${requester.lastName}`,
            roomName: conflictingBooking.roomId === 1 ? 'Conference Room 1' : 'Cabin 1',
            date: conflictingBooking.date,
            startTime: conflictingBooking.startTime,
            endTime: conflictingBooking.endTime,
            reason: validatedData.reason
          });
        }
      }
      
      res.json(priorityRequest);
    } catch (error) {
      console.error("Error creating priority request:", error);
      res.status(500).json({ message: "Failed to create priority request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
