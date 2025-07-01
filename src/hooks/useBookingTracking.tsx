
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BookingWithTracking {
  id: string;
  ad_id: string;
  customer_id: string;
  worker_id: string;
  status: string;
  provider_location_lat?: number;
  provider_location_lng?: number;
  eta_minutes?: number;
  status_history: any[];
  payment_method?: string;
  payment_status: string;
  total_amount?: number;
  emergency_contact?: any;
  created_at: string;
  ad: {
    title: string;
    price: number;
  };
  worker: {
    full_name: string;
    phone_number?: string;
    profile_image_url?: string;
  };
  customer: {
    full_name: string;
    phone_number?: string;
  };
}

export const useBookingTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeBookings, setActiveBookings] = useState<BookingWithTracking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveBookings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          ad:ad_id (title, price),
          worker:worker_id (full_name, phone_number, profile_image_url),
          customer:customer_id (full_name, phone_number)
        `)
        .or(`customer_id.eq.${user.id},worker_id.eq.${user.id}`)
        .in('status', ['pending', 'accepted', 'in_progress', 'en_route'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActiveBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string, location?: { lat: number; lng: number }) => {
    try {
      const updateData: any = {
        status: newStatus,
        status_history: supabase.sql`status_history || ${JSON.stringify([{
          status: newStatus,
          timestamp: new Date().toISOString(),
          updated_by: user?.id
        }])}`
      };

      if (location) {
        updateData.provider_location_lat = location.lat;
        updateData.provider_location_lng = location.lng;
      }

      const { error } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Booking status changed to ${newStatus.replace('_', ' ')}`,
      });

      fetchActiveBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const updateETA = async (bookingId: string, etaMinutes: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ eta_minutes: etaMinutes })
        .eq('id', bookingId);

      if (error) throw error;

      fetchActiveBookings();
    } catch (error) {
      console.error('Error updating ETA:', error);
    }
  };

  const shareEmergencyContact = async (bookingId: string, emergencyContact: any) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ emergency_contact: emergencyContact })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: "Emergency contact shared",
        description: "Your emergency contact has been shared with the service provider",
      });

      fetchActiveBookings();
    } catch (error) {
      console.error('Error sharing emergency contact:', error);
      toast({
        title: "Error",
        description: "Failed to share emergency contact",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchActiveBookings();

    // Set up real-time subscription for booking updates
    const channel = supabase
      .channel('booking-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchActiveBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    activeBookings,
    loading,
    updateBookingStatus,
    updateETA,
    shareEmergencyContact,
    refetch: fetchActiveBookings
  };
};
