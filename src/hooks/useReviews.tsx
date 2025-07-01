
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  booking_id?: string;
  rating: number;
  title?: string;
  comment?: string;
  helpful_count: number;
  response?: string;
  response_date?: string;
  created_at: string;
  reviewer: {
    full_name: string;
    profile_image_url?: string;
  };
}

export const useReviews = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id (
            full_name,
            profile_image_url
          )
        `)
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: {
    reviewee_id: string;
    booking_id?: string;
    rating: number;
    title?: string;
    comment?: string;
  }) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          ...reviewData,
          reviewer_id: user.id
        });

      if (error) throw error;

      toast({
        title: "Review submitted!",
        description: "Thank you for your feedback.",
      });

      // Update the reviewee's average rating
      await updateUserRating(reviewData.reviewee_id);

    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateUserRating = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('reviews')
        .select('rating')
        .eq('reviewee_id', userId);

      if (data && data.length > 0) {
        const avgRating = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
        
        await supabase
          .from('profiles')
          .update({
            rating: Math.round(avgRating * 10) / 10,
            total_ratings: data.length
          })
          .eq('id', userId);
      }
    } catch (error) {
      console.error('Error updating user rating:', error);
    }
  };

  return {
    reviews,
    loading,
    fetchReviews,
    createReview
  };
};
