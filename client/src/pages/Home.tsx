import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { isUnauthorizedError } from '@/lib/authUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Building, CalendarCheck, Clock, History, Users, DoorOpen, X } from 'lucide-react';
import { BookingForm } from '@/components/BookingForm';
import { VoiceAssistant } from '@/components/VoiceAssistant';

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('booking');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, isLoading, toast]);

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest('POST', `/api/bookings/cancel/${bookingId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Booking cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('conference room')) {
      setActiveTab('booking');
      toast({
        title: "Voice Command",
        description: "Switching to booking form for Conference Room 1",
      });
    }
    
    if (lowerCommand.includes('cabin')) {
      setActiveTab('booking');
      toast({
        title: "Voice Command",
        description: "Switching to booking form for Cabin 1",
      });
    }
  };

  const handleCancelBooking = (bookingId: number) => {
    cancelBookingMutation.mutate(bookingId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-100 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Building className="text-white w-8 h-8" />
          </div>
          <p className="text-blue-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const now = new Date();
  const futureBookings = bookings.filter((booking: any) => {
    const bookingDate = new Date(`${booking.date} ${booking.startTime}`);
    return bookingDate > now && booking.status === 'confirmed';
  });

  const pastBookings = bookings.filter((booking: any) => {
    const bookingDate = new Date(`${booking.date} ${booking.startTime}`);
    return bookingDate <= now || booking.status === 'cancelled';
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-slate-100 to-amber-100">
      {/* Navigation Header */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <svg width="40" height="40" viewBox="0 0 100 100" className="mr-3">
                  <defs>
                    <linearGradient id="logoGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e40af" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                    <linearGradient id="metallicGradientSmall" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fefce8" />
                      <stop offset="50%" stopColor="#f3f4f6" />
                      <stop offset="100%" stopColor="#e5e7eb" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="45" fill="url(#metallicGradientSmall)" stroke="#d1d5db" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="35" fill="url(#logoGradientSmall)"/>
                  <g fill="white" transform="translate(50,50)">
                    <rect x="-12" y="-15" width="4" height="30"/>
                    <rect x="-8" y="-3" width="15" height="3" transform="rotate(-30)"/>
                    <rect x="-8" y="0" width="15" height="3" transform="rotate(30)"/>
                  </g>
                </svg>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Kofuku
                  </h1>
                  <p className="text-xs text-blue-600">Room Booking</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Voice Assistant */}
              <VoiceAssistant onVoiceCommand={handleVoiceCommand} />

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-800 font-semibold text-sm">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <span className="text-blue-800 font-medium">
                  {user.firstName} {user.lastName}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex space-x-1 bg-white/30 p-1 rounded-2xl w-fit">
            <TabsList className="bg-transparent">
              <TabsTrigger 
                value="booking" 
                className="px-6 py-3 rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:text-blue-800 data-[state=active]:shadow-sm"
              >
                <CalendarCheck className="w-4 h-4 mr-2" />
                Book Room
              </TabsTrigger>
              <TabsTrigger 
                value="future" 
                className="px-6 py-3 rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:text-blue-800 data-[state=active]:shadow-sm"
              >
                <Clock className="w-4 h-4 mr-2" />
                Future Bookings
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="px-6 py-3 rounded-xl font-medium data-[state=active]:bg-white data-[state=active]:text-blue-800 data-[state=active]:shadow-sm"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="booking">
            <BookingForm />
          </TabsContent>

          <TabsContent value="future">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Future Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-blue-600">Loading bookings...</p>
                  </div>
                ) : futureBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-blue-600">No future bookings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {futureBookings.map((booking: any) => (
                      <Card key={booking.id} className="bg-white/30 border-white/20 hover:bg-white/40 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                {booking.room.includes('Conference') ? (
                                  <Users className="text-blue-600 w-5 h-5" />
                                ) : (
                                  <DoorOpen className="text-blue-600 w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold text-blue-800">{booking.room}</h4>
                                <p className="text-blue-600 text-sm">
                                  {booking.date} | {booking.startTime} - {booking.endTime}
                                </p>
                                <p className="text-blue-700 text-sm">{booking.purpose}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                {booking.status}
                              </Badge>
                              <Button
                                onClick={() => handleCancelBooking(booking.id)}
                                disabled={cancelBookingMutation.isPending}
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Booking History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <p className="text-blue-600">Loading bookings...</p>
                  </div>
                ) : pastBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-blue-600">No booking history</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map((booking: any) => (
                      <Card key={booking.id} className="bg-white/30 border-white/20">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                {booking.room.includes('Conference') ? (
                                  <Users className="text-gray-500 w-5 h-5" />
                                ) : (
                                  <DoorOpen className="text-gray-500 w-5 h-5" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-blue-700">{booking.room}</h4>
                                <p className="text-blue-500 text-sm">
                                  {booking.date} | {booking.startTime} - {booking.endTime}
                                </p>
                                <p className="text-blue-600 text-sm">{booking.purpose}</p>
                              </div>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={
                                booking.status === 'cancelled' 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-gray-100 text-gray-600'
                              }
                            >
                              {booking.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
