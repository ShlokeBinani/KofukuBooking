import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient as globalQueryClient } from '@/lib/queryClient';
import { Bell, Users, Calendar, Settings, Plus, Trash2, UserCheck, UserX, Zap, Crown, BarChart3, Shield, TrendingUp, Activity, AlertTriangle, CheckCircle, XCircle, Clock, Edit, Building, Team as TeamIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { User, Room, AdminNotification, Team } from '@shared/schema';

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddTeamOpen, setIsAddTeamOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Fetch admin data
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: notifications = [] } = useQuery<AdminNotification[]>({
    queryKey: ['/api/admin/notifications'],
  });

  const { data: rooms = [] } = useQuery<Room[]>({
    queryKey: ['/api/rooms'],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });

  const { data: priorityRequests = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/priority-requests'],
  });

  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ['/api/bookings'],
  });

  // Mutations
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) throw new Error('Failed to update role');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'Success', description: 'User role updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update user role', variant: 'destructive' });
    },
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!response.ok) throw new Error('Failed to update status');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: 'Success', description: 'User status updated successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' });
    },
  });

  const addRoomMutation = useMutation({
    mutationFn: async (roomData: { name: string; capacity: number }) => {
      const response = await fetch('/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
      if (!response.ok) throw new Error('Failed to add room');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      setIsAddRoomOpen(false);
      toast({ title: 'Success', description: 'Room added successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add room', variant: 'destructive' });
    },
  });

  const removeRoomMutation = useMutation({
    mutationFn: async (roomId: number) => {
      const response = await fetch(`/api/admin/rooms/${roomId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove room');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rooms'] });
      toast({ title: 'Success', description: 'Room removed successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to remove room', variant: 'destructive' });
    },
  });

  // Team Management Mutations
  const addTeamMutation = useMutation({
    mutationFn: async (teamData: { name: string }) => {
      const response = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamData),
      });
      if (!response.ok) throw new Error('Failed to add team');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      setIsAddTeamOpen(false);
      toast({ title: 'Success ✨', description: 'Team added successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to add team', variant: 'destructive' });
    },
  });

  const removeTeamMutation = useMutation({
    mutationFn: async (teamId: number) => {
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove team');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({ title: 'Success ✨', description: 'Team removed successfully' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to remove team', variant: 'destructive' });
    },
  });

  // Priority Request Mutations
  const approvePriorityRequestMutation = useMutation({
    mutationFn: async ({ requestId, newBookingData }: { requestId: number, newBookingData: any }) => {
      const response = await fetch(`/api/admin/priority-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newBookingData }),
      });
      if (!response.ok) throw new Error('Failed to approve request');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/priority-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({ title: 'Success ⚡', description: 'Priority request approved! Booking transferred.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to approve request', variant: 'destructive' });
    },
  });

  const rejectPriorityRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await fetch(`/api/admin/priority-requests/${requestId}/reject`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reject request');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/priority-requests'] });
      toast({ title: 'Request Rejected', description: 'Priority request has been rejected.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to reject request', variant: 'destructive' });
    },
  });

  // Computed stats
  const activeUsers = users.filter(user => user.isActive);
  const admins = users.filter(user => user.role === 'admin');
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const pendingRequests = priorityRequests.filter((req: any) => req.status === 'pending');
  const todaysBookings = bookings.filter((booking: any) => {
    const today = new Date().toISOString().split('T')[0];
    return booking.date === today;
  });

  return (
    <>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/5 to-cyan-400/5"
          animate={{
            background: [
              "linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05), rgba(6, 182, 212, 0.05))",
              "linear-gradient(315deg, rgba(147, 51, 234, 0.05), rgba(6, 182, 212, 0.05), rgba(59, 130, 246, 0.05))",
              "linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05), rgba(6, 182, 212, 0.05))"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        {/* Floating admin orbs */}
        <motion.div
          className="absolute top-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [-5, 5, -5],
            y: [-5, 5, -5],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>

      <div className="min-h-screen relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto space-y-8"
        >
          {/* Enhanced Header */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl"
              >
                <Crown className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Admin Command Center
                </h1>
                <p className="text-gray-600 mt-2 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Complete system management & analytics
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Badge variant="secondary" className="text-purple-800 bg-purple-100 px-3 py-2">
                  <Bell className="w-4 h-4 mr-1" />
                  {unreadNotifications.length} alerts
                </Badge>
              </motion.div>
              {pendingRequests.length > 0 && (
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Badge variant="destructive" className="px-3 py-2">
                    <Zap className="w-4 h-4 mr-1" />
                    {pendingRequests.length} priority
                  </Badge>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={() => window.location.href = '/api/logout'}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  Logout
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Stats Dashboard */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{users.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Active Users</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{activeUsers.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Admins</CardTitle>
              <Settings className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{admins.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Rooms</CardTitle>
              <Calendar className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{rooms.length}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Management */}
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle className="text-blue-900">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-amber-200 rounded-lg bg-amber-50/50">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium text-blue-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-blue-700">{user.email}</p>
                    </div>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={user.role}
                      onValueChange={(role) => updateUserRoleMutation.mutate({ userId: user.id, role })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="employee">Employee</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant={user.isActive ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => updateUserStatusMutation.mutate({ userId: user.id, isActive: !user.isActive })}
                    >
                      {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Room Management */}
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-blue-900">Room Management</CardTitle>
            <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Room</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    addRoomMutation.mutate({
                      name: formData.get('name') as string,
                      capacity: parseInt(formData.get('capacity') as string),
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="name">Room Name</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input id="capacity" name="capacity" type="number" required />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Add Room
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="p-4 border border-amber-200 rounded-lg bg-amber-50/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-blue-900">{room.name}</h3>
                      <p className="text-sm text-blue-700">Capacity: {room.capacity}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeRoomMutation.mutate(room.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        {notifications.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border ${
                      notification.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <h4 className="font-medium text-blue-900">{notification.title}</h4>
                    <p className="text-sm text-blue-700">{notification.message}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      {new Date(notification.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}