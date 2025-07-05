import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertBookingSchema, insertPriorityRequestSchema } from "@shared/schema";
import { sendBookingConfirmation, sendPriorityRequest } from "./services/emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize data
  await storage.initializeRooms();
  await storage.initializeTeams();

  // Auth routes handled by auth.ts - /api/me, /api/login, /api/logout, /api/register

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
      const userId = req.user.id;
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
        // Get detailed conflicting bookings with user information
        const conflictingBookings = await storage.getConflictingBookingsWithUsers(roomId, date, startTime, endTime);
        const rooms = await storage.getRooms();
        const room = rooms.find(r => r.id === roomId);
        
        res.json({ 
          available: false,
          conflictingBookings: conflictingBookings,
          conflict: conflictingBookings.length > 0 ? {
            id: conflictingBookings[0].id,
            room: room?.name || 'Unknown Room',
            bookedBy: `${conflictingBookings[0].user.firstName} ${conflictingBookings[0].user.lastName}`,
            startTime: conflictingBookings[0].startTime,
            endTime: conflictingBookings[0].endTime,
            date: conflictingBookings[0].date
          } : null
        });
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      res.status(500).json({ message: "Failed to check availability" });
    }
  });

  app.post('/api/bookings/create', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookingData = { ...req.body, userId };
      
      // Validate the booking data
      const validatedData = insertBookingSchema.parse(bookingData);
      
      // Ensure roomId is defined
      if (!validatedData.roomId) {
        return res.status(400).json({ message: "Room ID is required" });
      }
      
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
      const userId = req.user.id;
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
  app.post('/api/priority-requests', isAuthenticated, async (req: any, res) => {
    try {
      const requesterId = req.user.id;
      const { conflictBookingId, reason, newBookingData } = req.body;
      
      const priorityRequest = await storage.createPriorityRequest({
        requesterId,
        conflictBookingId,
        reason,
        status: 'pending'
      });
      
      // Create admin notification
      await storage.createAdminNotification({
        type: 'priority_request',
        title: 'New Priority Booking Request',
        message: `${req.user.firstName} ${req.user.lastName} has requested priority booking`,
        relatedId: priorityRequest.id,
        isRead: false
      });
      
      // Get the conflicting booking and its owner for email notification
      const conflictingBooking = await storage.getBookings().then(bookings => 
        bookings.find(b => b.id === conflictBookingId)
      );
      
      if (conflictingBooking) {
        const conflictOwner = await storage.getUser(conflictingBooking.userId);
        const rooms = await storage.getRooms();
        const room = rooms.find(r => r.id === conflictingBooking.roomId);
        
        if (conflictOwner?.email) {
          await sendPriorityRequest(conflictOwner.email, {
            requesterName: `${req.user.firstName} ${req.user.lastName}`,
            roomName: room?.name || 'Unknown Room',
            date: conflictingBooking.date,
            startTime: conflictingBooking.startTime,
            endTime: conflictingBooking.endTime,
            reason: reason
          });
        }
      }
      
      res.json(priorityRequest);
    } catch (error) {
      console.error("Error creating priority request:", error);
      res.status(500).json({ message: "Failed to create priority request" });
    }
  });

  // Admin - Get all priority requests
  app.get('/api/admin/priority-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const requests = await storage.getPriorityRequests();
      
      // Enrich with user and booking details
      const enrichedRequests = await Promise.all(requests.map(async (request) => {
        const requester = await storage.getUser(request.requesterId);
        const bookings = await storage.getBookings();
        const conflictBooking = bookings.find(b => b.id === request.conflictBookingId);
        const conflictOwner = conflictBooking ? await storage.getUser(conflictBooking.userId) : null;
        const rooms = await storage.getRooms();
        const room = conflictBooking ? rooms.find(r => r.id === conflictBooking.roomId) : null;
        
        return {
          ...request,
          requester: requester ? {
            firstName: requester.firstName,
            lastName: requester.lastName,
            email: requester.email
          } : null,
          conflictBooking: conflictBooking ? {
            ...conflictBooking,
            room: room?.name || 'Unknown Room',
            owner: conflictOwner ? {
              firstName: conflictOwner.firstName,
              lastName: conflictOwner.lastName,
              email: conflictOwner.email
            } : null
          } : null
        };
      }));
      
      res.json(enrichedRequests);
    } catch (error) {
      console.error("Error fetching priority requests:", error);
      res.status(500).json({ message: "Failed to fetch priority requests" });
    }
  });

  // Admin - Approve/Reject priority request
  app.post('/api/admin/priority-requests/:id/:action', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const requestId = parseInt(req.params.id);
      const action = req.params.action; // 'approve' or 'reject'
      
      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action' });
      }
      
      const requests = await storage.getPriorityRequests();
      const request = requests.find(r => r.id === requestId);
      
      if (!request) {
        return res.status(404).json({ message: 'Priority request not found' });
      }
      
      const status = action === 'approve' ? 'approved' : 'rejected';
      await storage.updatePriorityRequestStatus(requestId, status);
      
      if (action === 'approve') {
        // Transfer the booking - cancel original and create new one
        const { newBookingData } = req.body;
        if (newBookingData) {
          await storage.transferBooking(request.conflictBookingId, request.requesterId, newBookingData);
        }
      }
      
      res.json({ message: `Priority request ${action}d successfully` });
    } catch (error) {
      console.error(`Error ${req.params.action}ing priority request:`, error);
      res.status(500).json({ message: `Failed to ${req.params.action} priority request` });
    }
  });

  // Admin routes - require admin role
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post('/api/admin/users/:userId/role', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { userId: targetUserId } = req.params;
      const { role } = req.body;
      
      const success = await storage.updateUserRole(targetUserId, role);
      if (success) {
        res.json({ message: 'User role updated successfully' });
      } else {
        res.status(500).json({ message: 'Failed to update user role' });
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.post('/api/admin/users/:userId/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const { userId: targetUserId } = req.params;
      const { isActive } = req.body;
      
      const success = await storage.updateUserStatus(targetUserId, isActive);
      if (success) {
        res.json({ message: 'User status updated successfully' });
      } else {
        res.status(500).json({ message: 'Failed to update user status' });
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Admin notifications
  app.get('/api/admin/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const notifications = await storage.getAdminNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/admin/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const notificationId = parseInt(req.params.id);
      const success = await storage.markNotificationRead(notificationId);
      
      if (success) {
        res.json({ message: 'Notification marked as read' });
      } else {
        res.status(500).json({ message: 'Failed to mark notification as read' });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Admin room management
  app.post('/api/admin/rooms', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const room = await storage.addRoom(req.body);
      res.json(room);
    } catch (error) {
      console.error("Error adding room:", error);
      res.status(500).json({ message: "Failed to add room" });
    }
  });

  app.put('/api/admin/rooms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const roomId = parseInt(req.params.id);
      const success = await storage.updateRoom(roomId, req.body);
      
      if (success) {
        res.json({ message: 'Room updated successfully' });
      } else {
        res.status(500).json({ message: 'Failed to update room' });
      }
    } catch (error) {
      console.error("Error updating room:", error);
      res.status(500).json({ message: "Failed to update room" });
    }
  });

  app.delete('/api/admin/rooms/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const roomId = parseInt(req.params.id);
      const success = await storage.removeRoom(roomId);
      
      if (success) {
        res.json({ message: 'Room removed successfully' });
      } else {
        res.status(500).json({ message: 'Failed to remove room' });
      }
    } catch (error) {
      console.error("Error removing room:", error);
      res.status(500).json({ message: "Failed to remove room" });
    }
  });

  // Admin team management
  app.post('/api/admin/teams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const team = await storage.addTeam(req.body);
      res.json(team);
    } catch (error) {
      console.error("Error adding team:", error);
      res.status(500).json({ message: "Failed to add team" });
    }
  });

  app.put('/api/admin/teams/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const teamId = parseInt(req.params.id);
      const success = await storage.updateTeam(teamId, req.body);
      
      if (success) {
        res.json({ message: 'Team updated successfully' });
      } else {
        res.status(500).json({ message: 'Failed to update team' });
      }
    } catch (error) {
      console.error("Error updating team:", error);
      res.status(500).json({ message: "Failed to update team" });
    }
  });

  app.delete('/api/admin/teams/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const currentUser = await storage.getUser(userId);
      
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
      }
      
      const teamId = parseInt(req.params.id);
      const success = await storage.removeTeam(teamId);
      
      if (success) {
        res.json({ message: 'Team removed successfully' });
      } else {
        res.status(500).json({ message: 'Failed to remove team' });
      }
    } catch (error) {
      console.error("Error removing team:", error);
      res.status(500).json({ message: "Failed to remove team" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
