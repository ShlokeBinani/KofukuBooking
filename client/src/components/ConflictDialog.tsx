import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Users, DoorOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConflictData {
  id: number;
  room: string;
  bookedBy: string;
  startTime: string;
  endTime: string;
  date: string;
}

interface ConflictDialogProps {
  isOpen: boolean;
  onClose: () => void;
  conflictData: ConflictData | null;
}

export function ConflictDialog({ isOpen, onClose, conflictData }: ConflictDialogProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const { toast } = useToast();

  const requestPriorityMutation = useMutation({
    mutationFn: async () => {
      if (!conflictData) return;
      
      const response = await apiRequest('POST', '/api/bookings/request-priority', {
        conflictBookingId: conflictData.id,
        reason: 'Urgent work requirement',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Priority Request Sent",
        description: "Your priority request has been sent. You will be notified of the decision.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send priority request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePriorityRequest = async () => {
    setIsRequesting(true);
    await requestPriorityMutation.mutateAsync();
    setIsRequesting(false);
  };

  if (!conflictData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white/95 backdrop-blur-lg border-white/20">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-yellow-600 w-8 h-8" />
          </div>
          <DialogTitle className="text-xl font-bold text-blue-800 mb-2">
            Booking Conflict
          </DialogTitle>
          <p className="text-blue-600">
            The selected room is already booked for this time.
          </p>
        </DialogHeader>

        <Card className="bg-white/30 border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {conflictData.room.includes('Conference') ? (
                  <Users className="text-blue-600 w-5 h-5" />
                ) : (
                  <DoorOpen className="text-blue-600 w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-blue-800">{conflictData.room}</h4>
                <p className="text-blue-600 text-sm">Booked by {conflictData.bookedBy}</p>
                <p className="text-blue-600 text-sm">
                  {conflictData.date} | {conflictData.startTime} - {conflictData.endTime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex space-x-3 mt-6">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-white/50 text-blue-700 border-gray-300 hover:bg-white/70"
          >
            Choose Different Time
          </Button>
          <Button
            onClick={handlePriorityRequest}
            disabled={isRequesting || requestPriorityMutation.isPending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white"
          >
            {isRequesting || requestPriorityMutation.isPending ? 'Requesting...' : 'Request Priority'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
