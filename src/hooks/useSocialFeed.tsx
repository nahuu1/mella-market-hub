
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FeedActivity {
  id: string;
  user_id: string;
  activity_type: string;
  content: any;
  visibility: string;
  created_at: string;
  user: {
    full_name: string;
    profile_image_url?: string;
    is_verified: boolean;
    badges: string[];
  };
}

export const useSocialFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<FeedActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const { data, error } = await supabase
        .from('feed_activities')
        .select(`
          *,
          user:user_id (
            full_name,
            profile_image_url,
            is_verified,
            badges
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedActivities = (data || []).map(activity => ({
        ...activity,
        user: {
          full_name: activity.user?.full_name || 'Unknown User',
          profile_image_url: activity.user?.profile_image_url,
          is_verified: activity.user?.is_verified || false,
          badges: Array.isArray(activity.user?.badges) ? activity.user.badges : []
        }
      }));
      
      setActivities(transformedActivities as FeedActivity[]);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const createActivity = async (activityType: string, content: any, visibility = 'public') => {
    if (!user) return;

    try {
      await supabase
        .from('feed_activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          content,
          visibility
        });
      
      fetchFeed(); // Refresh feed
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  };

  useEffect(() => {
    fetchFeed();

    // Set up real-time subscription
    const channel = supabase
      .channel('feed-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'feed_activities'
        },
        () => {
          fetchFeed();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    activities,
    loading,
    createActivity,
    refetch: fetchFeed
  };
};
