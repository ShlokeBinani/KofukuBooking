import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient as globalQueryClient } from '@/lib/queryClient';
import { Bell, Users, Calendar, Settings, Plus, Trash2, UserCheck, UserX } from 'lucide-react';
import type { User, Room, AdminNotification } from '@shared/schema';

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

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

  const activeUsers = users.filter(user => user.isActive);
  const admins = users.filter(user => user.role === 'admin');
  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-blue-900">Admin Dashboard</h1>
            <p className="text-blue-700 mt-2">Manage users, rooms, and system settings</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-blue-800">
              <Bell className="w-4 h-4 mr-1" />
              {unreadNotifications.length} unread
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        </div>

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