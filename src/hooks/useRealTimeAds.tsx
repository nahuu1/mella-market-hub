
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Ad {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image_url: string | null;
  location_lat: number | null;
  location_lng: number | null;
  user_id: string;
  created_at: string;
  is_active: boolean;
  profiles?: {
    full_name: string;
    rating: number;
    profile_image_url: string;
  };
}

export const useRealTimeAds = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select(`
          *,
          profiles:user_id (
            full_name,
            rating,
            profile_image_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ads:', error);
        return;
      }

      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();

    // Set up real-time subscription for ads
    const channel = supabase
      .channel('ads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ads'
        },
        (payload) => {
          console.log('Real-time ads update:', payload);
          fetchAds(); // Refetch to get complete data with profiles
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const searchAds = async (query: string, location?: { lat: number; lng: number }, radius?: number) => {
    try {
      let queryBuilder = supabase
        .from('ads')
        .select(`
          *,
          profiles:user_id (
            full_name,
            rating,
            profile_image_url
          )
        `)
        .eq('is_active', true);

      if (query) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching ads:', error);
        return [];
      }

      let filteredData = data || [];

      // Filter by location if provided
      if (location && radius && filteredData.length > 0) {
        filteredData = filteredData.filter(ad => {
          if (!ad.location_lat || !ad.location_lng) return false;
          
          const distance = calculateDistance(
            location.lat,
            location.lng,
            ad.location_lat,
            ad.location_lng
          );
          
          return distance <= radius;
        });
      }

      return filteredData;
    } catch (error) {
      console.error('Error searching ads:', error);
      return [];
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  return { ads, loading, searchAds, refetch: fetchAds };
};
