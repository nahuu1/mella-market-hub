
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BookingData {
  adId: string;
  workerId: string;
  message?: string;
  serviceDate?: string;
}

export const useBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createBooking = async (bookingData: BookingData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a service",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Get customer profile for phone number
      const { data: customerProfile } = await supabase
        .from('profiles')
        .select('full_name, phone_number')
        .eq('id', user.id)
        .single();

      // Get ad details
      const { data: adData } = await supabase
        .from('ads')
        .select('title, user_id')
        .eq('id', bookingData.adId)
        .single();

      if (!adData) {
        throw new Error('Ad not found');
      }

      // Create booking
      const { data: booking, error } = await supabase
        .from('bookings')
        .insert([{
          ad_id: bookingData.adId,
          customer_id: user.id,
          worker_id: bookingData.workerId,
          message: bookingData.message,
          service_date: bookingData.serviceDate
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Create notification for the worker
      const customerName = customerProfile?.full_name || user.email;
      const customerPhone = customerProfile?.phone_number || 'Not provided';
      
      await supabase
        .from('notifications')
        .insert([{
          user_id: bookingData.workerId,
          type: 'booking_request',
          title: 'New Booking Request',
          message: `${customerName} wants to book your service "${adData.title}". Phone: ${customerPhone}`,
          data: {
            booking_id: booking.id,
            customer_name: customerName,
            customer_phone: customerPhone,
            ad_title: adData.title,
            message: bookingData.message
          }
        }]);

      toast({
        title: "Booking request sent!",
        description: "The service provider will contact you soon.",
      });

      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking failed",
        description: "Unable to send booking request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    createBooking,
    loading
  };
};
