import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, Users, DoorOpen } from 'lucide-react';
import { ConflictDialog } from './ConflictDialog';
import { useToast } from '@/hooks/use-toast';

const bookingSchema = z.object({
  roomId: z.number().min(1, 'Please select a room'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  purpose: z.string().min(5, 'Purpose must be at least 5 characters'),
  bookingType: z.enum(['personal', 'team']),
  team: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface ConflictData {
  id: number;
  room: string;
  bookedBy: string;
  startTime: string;
  endTime: string;
  date: string;
}

export function BookingForm() {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [conflictData, setConflictData] = useState<ConflictData | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rooms = [] } = useQuery({
    queryKey: ['/api/rooms'],
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['/api/teams'],
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      bookingType: 'personal',
    },
  });

  const bookingType = form.watch('bookingType');

  const checkAvailabilityMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await apiRequest('POST', '/api/bookings/check-availability', data);
      return response.json();
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await apiRequest('POST', '/api/bookings/create', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Room booked successfully! Confirmation email sent.",
      });
      form.reset();
      setSelectedRoomId(null);
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    try {
      const result = await checkAvailabilityMutation.mutateAsync(data);
      
      if (result.available) {
        await createBookingMutation.mutateAsync(data);
      } else {
        setConflictData(result.conflict);
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const handleRoomSelect = (roomId: number) => {
    setSelectedRoomId(roomId);
    form.setValue('roomId', roomId);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Room Selection */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5" />
              Select a Room
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rooms.map((room: any) => (
              <div
                key={room.id}
                onClick={() => handleRoomSelect(room.id)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedRoomId === room.id
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-gray-300 hover:border-blue-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      {room.name.includes('Conference') ? (
                        <Users className="text-blue-600 w-6 h-6" />
                      ) : (
                        <DoorOpen className="text-blue-600 w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800">{room.name}</h4>
                      <p className="text-blue-600 text-sm">Capacity: {room.capacity} people</p>
                      <p className="text-green-600 text-sm font-medium">Available</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">
                    {selectedRoomId === room.id && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-blue-800">Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-blue-700 font-medium">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    {...form.register('date')}
                    className="bg-white/50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {form.formState.errors.date && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>
                  )}
                </div>
                <div>
                  <Label className="text-blue-700 font-medium">Duration</Label>
                  <Select>
                    <SelectTrigger className="bg-white/50 border-gray-300">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="8">8 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime" className="text-blue-700 font-medium">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...form.register('startTime')}
                    className="bg-white/50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {form.formState.errors.startTime && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.startTime.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-blue-700 font-medium">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    {...form.register('endTime')}
                    className="bg-white/50 border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {form.formState.errors.endTime && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.endTime.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-blue-700 font-medium">Booking Type</Label>
                <RadioGroup
                  value={bookingType}
                  onValueChange={(value: 'personal' | 'team') => form.setValue('bookingType', value)}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="personal" id="personal" />
                    <Label htmlFor="personal" className="text-blue-700">Personal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="team" id="team" />
                    <Label htmlFor="team" className="text-blue-700">Team</Label>
                  </div>
                </RadioGroup>
              </div>

              {bookingType === 'team' && (
                <div>
                  <Label className="text-blue-700 font-medium">Team</Label>
                  <Select onValueChange={(value) => form.setValue('team', value)}>
                    <SelectTrigger className="bg-white/50 border-gray-300">
                      <SelectValue placeholder="Select your team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team: any) => (
                        <SelectItem key={team.id} value={team.name}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="purpose" className="text-blue-700 font-medium">Purpose</Label>
                <Textarea
                  id="purpose"
                  {...form.register('purpose')}
                  placeholder="Describe the purpose of your booking..."
                  className="bg-white/50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
                {form.formState.errors.purpose && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.purpose.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={checkAvailabilityMutation.isPending || createBookingMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300"
              >
                <CalendarCheck className="w-5 h-5 mr-2" />
                {checkAvailabilityMutation.isPending || createBookingMutation.isPending ? 'Booking...' : 'Book Room'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <ConflictDialog
        isOpen={!!conflictData}
        onClose={() => setConflictData(null)}
        conflictData={conflictData}
      />
    </>
  );
}
