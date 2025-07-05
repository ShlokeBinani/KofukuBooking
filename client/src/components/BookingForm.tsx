import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, Users, DoorOpen, Clock, CheckCircle, XCircle, Sparkles, Zap } from 'lucide-react';
import { ConflictDialog } from './ConflictDialog';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [availabilityStatus, setAvailabilityStatus] = useState<{ [key: number]: 'available' | 'unavailable' | 'checking' }>({});
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setIsFormVisible(true);
  }, []);

  const { data: rooms = [] } = useQuery<any[]>({
    queryKey: ['/api/rooms'],
  });

  const { data: teams = [] } = useQuery<any[]>({
    queryKey: ['/api/teams'],
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      bookingType: 'personal',
    },
  });

  const bookingType = form.watch('bookingType');
  const selectedDate = form.watch('date');
  const selectedStartTime = form.watch('startTime');
  const selectedEndTime = form.watch('endTime');

  // Check availability when date/time changes
  useEffect(() => {
    if (selectedDate && selectedStartTime && selectedEndTime && Array.isArray(rooms) && rooms.length > 0) {
      checkRoomAvailability();
    }
  }, [selectedDate, selectedStartTime, selectedEndTime, rooms]);

  // Clear selected room if it becomes unavailable
  useEffect(() => {
    if (selectedRoomId && availabilityStatus[selectedRoomId] === 'unavailable') {
      setSelectedRoomId(null);
      form.setValue('roomId', 0);
      toast({
        title: "Room Selection Cleared",
        description: "The selected room is no longer available for this time slot.",
        variant: "destructive",
      });
    }
  }, [availabilityStatus, selectedRoomId]);

  const checkRoomAvailability = async () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) return;

    console.log('Checking availability for:', { selectedDate, selectedStartTime, selectedEndTime });
    const roomsArray = Array.isArray(rooms) ? rooms : [];
    
    for (const room of roomsArray) {
      setAvailabilityStatus(prev => ({ ...prev, [room.id]: 'checking' }));
      
      try {
        const response = await apiRequest('POST', '/api/bookings/check-availability', {
          roomId: room.id,
          date: selectedDate,
          startTime: selectedStartTime,
          endTime: selectedEndTime
        });
        const result = await response.json();
        
        console.log(`Room ${room.name} (ID: ${room.id}) availability:`, result);
        
        setAvailabilityStatus(prev => ({ 
          ...prev, 
          [room.id]: result.available ? 'available' : 'unavailable' 
        }));
      } catch (error) {
        console.error(`Error checking availability for room ${room.id}:`, error);
        setAvailabilityStatus(prev => ({ ...prev, [room.id]: 'available' }));
      }
    }
  };

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
    // Check if selected room is currently unavailable
    const roomStatus = availabilityStatus[data.roomId];
    if (roomStatus === 'unavailable') {
      toast({
        title: "Room Unavailable",
        description: "The selected room is not available for the chosen time slot. Please select a different room or time.",
        variant: "destructive",
      });
      return;
    }

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
      {/* Parallax Background with Gemini Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-cyan-400/10"
          animate={{
            background: [
              "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(6, 182, 212, 0.1))",
              "linear-gradient(225deg, rgba(147, 51, 234, 0.1), rgba(6, 182, 212, 0.1), rgba(59, 130, 246, 0.1))",
              "linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(6, 182, 212, 0.1))"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            initial={{ x: Math.random() * window.innerWidth, y: window.innerHeight + 20 }}
            animate={{
              y: -20,
              x: Math.random() * window.innerWidth,
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isFormVisible ? 1 : 0, y: isFormVisible ? 0 : 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Room Selection with Advanced Animations */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-500 shadow-2xl hover:shadow-3xl relative overflow-hidden group">
              {/* Gemini Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-[1px] bg-white/5 rounded-lg" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Select a Room
                </CardTitle>
                <motion.p 
                  className="text-sm text-blue-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Choose a date and time first to see room availability
                </motion.p>
              </CardHeader>
              
              <CardContent className="space-y-4 relative z-10">
                <AnimatePresence>
                  {Array.isArray(rooms) && rooms.map((room: any, index: number) => {
                    const status = availabilityStatus[room.id];
                    const isAvailable = status === 'available';
                    const isChecking = status === 'checking';
                    const isUnavailable = status === 'unavailable';
                    const isHovered = hoveredRoom === room.id;
                    
                    return (
                      <motion.div
                        key={room.id}
                        initial={{ x: -50, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 50, opacity: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        whileHover={{ 
                          scale: isUnavailable ? 1 : 1.02,
                          transition: { duration: 0.2 }
                        }}
                        whileTap={{ scale: isUnavailable ? 1 : 0.98 }}
                        onHoverStart={() => setHoveredRoom(room.id)}
                        onHoverEnd={() => setHoveredRoom(null)}
                        onClick={() => isUnavailable ? null : handleRoomSelect(room.id)}
                        className={`p-4 border-2 rounded-xl transition-all duration-500 relative overflow-hidden ${
                          selectedRoomId === room.id
                            ? 'border-blue-500 bg-blue-50/50 shadow-lg'
                            : isUnavailable
                            ? 'border-red-300 bg-red-50/30 cursor-not-allowed opacity-75'
                            : 'border-gray-300 hover:border-blue-500 cursor-pointer hover:shadow-md'
                        }`}
                      >
                        {/* Animated Background Effect */}
                        {isHovered && !isUnavailable && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                        
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center space-x-4">
                            <motion.div 
                              className={`w-12 h-12 rounded-lg flex items-center justify-center relative overflow-hidden ${
                                isUnavailable ? 'bg-red-100' : 'bg-blue-100'
                              }`}
                              whileHover={{ rotate: isUnavailable ? 0 : 5 }}
                              transition={{ duration: 0.2 }}
                            >
                              {/* Icon Glow Effect */}
                              {isAvailable && (
                                <motion.div
                                  className="absolute inset-0 bg-green-400/20 rounded-lg"
                                  animate={{ opacity: [0, 1, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                              
                              {room.name.includes('Conference') ? (
                                <Users className={`w-6 h-6 relative z-10 ${isUnavailable ? 'text-red-600' : 'text-blue-600'}`} />
                              ) : (
                                <DoorOpen className={`w-6 h-6 relative z-10 ${isUnavailable ? 'text-red-600' : 'text-blue-600'}`} />
                              )}
                            </motion.div>
                            
                            <div>
                              <motion.h4 
                                className="font-semibold text-blue-800"
                                animate={{ x: isHovered ? 5 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                {room.name}
                              </motion.h4>
                              <p className="text-blue-600 text-sm">Capacity: {room.capacity} people</p>
                              
                              <div className="flex items-center space-x-2">
                                <AnimatePresence mode="wait">
                                  {isChecking ? (
                                    <motion.div
                                      key="checking"
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      className="flex items-center space-x-2"
                                    >
                                      <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                      >
                                        <Clock className="w-4 h-4 text-yellow-500" />
                                      </motion.div>
                                      <p className="text-yellow-600 text-sm font-medium">Checking...</p>
                                    </motion.div>
                                  ) : isAvailable ? (
                                    <motion.div
                                      key="available"
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      className="flex items-center space-x-2"
                                    >
                                      <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                      >
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                      </motion.div>
                                      <p className="text-green-600 text-sm font-medium">Available</p>
                                    </motion.div>
                                  ) : isUnavailable ? (
                                    <motion.div
                                      key="unavailable"
                                      initial={{ opacity: 0, scale: 0.8 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.8 }}
                                      className="flex items-center space-x-2"
                                    >
                                      <motion.div
                                        animate={{ x: [-2, 2, -2] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                      >
                                        <XCircle className="w-4 h-4 text-red-500" />
                                      </motion.div>
                                      <p className="text-red-600 text-sm font-medium">Unavailable</p>
                                    </motion.div>
                                  ) : (
                                    <motion.p
                                      key="default"
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="text-gray-500 text-sm"
                                    >
                                      Select date & time
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                          
                          <motion.div 
                            className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <AnimatePresence>
                              {selectedRoomId === room.id && (
                                <motion.div
                                  className="w-3 h-3 bg-blue-500 rounded-full"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                />
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Form with Enhanced Animations */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 hover:bg-white/15 transition-all duration-500 shadow-2xl hover:shadow-3xl relative overflow-hidden group">
              {/* Gemini Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-l from-purple-500/20 via-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-[1px] bg-white/5 rounded-lg" />
              
              <CardHeader className="relative z-10">
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-5 h-5" />
                  </motion.div>
                  Booking Details
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <Label htmlFor="date" className="text-blue-700 font-medium">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        {...form.register('date')}
                        className="bg-white/50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 focus:scale-105"
                      />
                      {form.formState.errors.date && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1"
                        >
                          {form.formState.errors.date.message}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <Label className="text-blue-700 font-medium">Duration</Label>
                      <Select>
                        <SelectTrigger className="bg-white/50 border-gray-300 hover:bg-white/70 transition-all duration-300">
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
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div>
                      <Label htmlFor="startTime" className="text-blue-700 font-medium">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        {...form.register('startTime')}
                        className="bg-white/50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 focus:scale-105"
                      />
                      {form.formState.errors.startTime && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1"
                        >
                          {form.formState.errors.startTime.message}
                        </motion.p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="endTime" className="text-blue-700 font-medium">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        {...form.register('endTime')}
                        className="bg-white/50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 focus:scale-105"
                      />
                      {form.formState.errors.endTime && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-1"
                        >
                          {form.formState.errors.endTime.message}
                        </motion.p>
                      )}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    <Label className="text-blue-700 font-medium">Booking Type</Label>
                    <RadioGroup
                      value={bookingType}
                      onValueChange={(value: 'personal' | 'team') => form.setValue('bookingType', value)}
                      className="flex space-x-4 mt-2"
                    >
                      <motion.div 
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <RadioGroupItem value="personal" id="personal" />
                        <Label htmlFor="personal" className="text-blue-700">Personal</Label>
                      </motion.div>
                      <motion.div 
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <RadioGroupItem value="team" id="team" />
                        <Label htmlFor="team" className="text-blue-700">Team</Label>
                      </motion.div>
                    </RadioGroup>
                  </motion.div>

                  <AnimatePresence>
                    {bookingType === 'team' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Label className="text-blue-700 font-medium">Team</Label>
                                                 <Select onValueChange={(value: string) => form.setValue('team', value)}>
                          <SelectTrigger className="bg-white/50 border-gray-300 hover:bg-white/70 transition-all duration-300">
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    <Label htmlFor="purpose" className="text-blue-700 font-medium">Purpose</Label>
                    <Textarea
                      id="purpose"
                      {...form.register('purpose')}
                      placeholder="Describe the purpose of your booking..."
                      className="bg-white/50 border-gray-300 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-300 focus:scale-105"
                      rows={3}
                    />
                    {form.formState.errors.purpose && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-sm mt-1"
                      >
                        {form.formState.errors.purpose.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={
                        checkAvailabilityMutation.isPending || 
                        createBookingMutation.isPending ||
                        !selectedRoomId ||
                        (selectedRoomId && availabilityStatus[selectedRoomId] === 'unavailable')
                      }
                      className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 hover:from-blue-700 hover:via-purple-700 hover:to-blue-900 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl relative overflow-hidden group"
                    >
                      {/* Button Shimmer Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      <CalendarCheck className="w-5 h-5 mr-2 relative z-10" />
                      <span className="relative z-10">
                        {checkAvailabilityMutation.isPending || createBookingMutation.isPending 
                          ? 'Booking...' 
                          : !selectedRoomId 
                          ? 'Select a Room' 
                          : selectedRoomId && availabilityStatus[selectedRoomId] === 'unavailable'
                          ? 'Room Unavailable'
                          : 'Book Room'
                        }
                      </span>
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      <ConflictDialog
        isOpen={!!conflictData}
        onClose={() => setConflictData(null)}
        conflictData={conflictData}
      />
    </>
  );
}
