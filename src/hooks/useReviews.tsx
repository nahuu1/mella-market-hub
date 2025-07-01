
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
  response?: string;
  response_date?: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  reviewer: {
    full_name: string;
    profile_image_url?: string;
  };
}

export const useReviews = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(full_name, profile_image_url)
        `)
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedReviews = (data || []).map(review => {
        const reviewerData = Array.isArray(review.reviewer) ? review.reviewer[0] : review.reviewer;
        
        return {
          ...review,
          reviewer: {
            full_name: reviewerData?.full_name || 'Anonymous',
            profile_image_url: reviewerData?.profile_image_url
          }
        };
      });
      
      setReviews(transformedReviews);
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
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          ...reviewData
        });

      if (error) throw error;

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      return true;
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateReview = async (reviewId: string, updates: {
    rating?: number;
    title?: string;
    comment?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Review updated",
        description: "Your review has been updated successfully",
      });

      return true;
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive",
      });
      return false;
    }
  };

  const addResponse = async (reviewId: string, response: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          response,
          response_date: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Response added",
        description: "Your response has been added to the review",
      });

      return true;
    } catch (error) {
      console.error('Error adding response:', error);
      toast({
        title: "Error",
        description: "Failed to add response",
        variant: "destructive",
      });
      return false;
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const { error } = await supabase.rpc('increment_helpful_count', {
        review_id: reviewId
      });

      if (error) throw error;

      // Refresh reviews to show updated count
      if (reviews.length > 0) {
        fetchReviews(reviews[0].reviewee_id);
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  return {
    reviews,
    loading,
    fetchReviews,
    createReview,
    updateReview,
    addResponse,
    markHelpful
  };
};
