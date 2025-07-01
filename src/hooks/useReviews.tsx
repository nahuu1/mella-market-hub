
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSocialFeed } from './useSocialFeed';

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

interface CreateReviewData {
  reviewee_id: string;
  booking_id?: string;
  rating: number;
  title?: string;
  comment?: string;
}

export const useReviews = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { createActivity } = useSocialFeed();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:reviewer_id (full_name, profile_image_url)
        `)
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedReviews = (data || []).map(review => ({
        ...review,
        reviewer: {
          full_name: review.reviewer?.full_name || 'Anonymous User',
          profile_image_url: review.reviewer?.profile_image_url
        }
      }));
      
      setReviews(transformedReviews as Review[]);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: CreateReviewData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to write a review",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: user.id,
          ...reviewData
        });

      if (error) throw error;

      // Create social feed activity
      createActivity('received_review', {
        rating: reviewData.rating,
        comment: reviewData.comment,
        reviewee_id: reviewData.reviewee_id
      });

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
        variant: "destructive"
      });
      return false;
    }
  };

  const updateReview = async (reviewId: string, updates: Partial<CreateReviewData>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId)
        .eq('reviewer_id', user.id);

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
        variant: "destructive"
      });
      return false;
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .rpc('increment_helpful_count', { review_id: reviewId });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: "Your feedback has been recorded",
      });
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
    markHelpful
  };
};
