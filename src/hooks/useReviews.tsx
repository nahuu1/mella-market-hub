
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  updated_at: string;
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
          reviewer:profiles!reviews_reviewer_id_fkey(full_name, profile_image_url)
        `)
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedReviews = (data || []).map(review => ({
        ...review,
        reviewer: {
          full_name: review.reviewer?.full_name || 'Anonymous',
          profile_image_url: review.reviewer?.profile_image_url
        }
      }));
      
      setReviews(transformedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: CreateReviewData) => {
    if (!user) return false;

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

      return true;
    } catch (error) {
      console.error('Error creating review:', error);
      return false;
    }
  };

  const updateReview = async (reviewId: string, updateData: Partial<CreateReviewData>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId)
        .eq('reviewer_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating review:', error);
      return false;
    }
  };

  const markReviewHelpful = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .rpc('increment_helpful_count', { review_id: reviewId });

      if (error) throw error;
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  const addResponse = async (reviewId: string, response: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          response,
          response_date: new Date().toISOString()
        })
        .eq('id', reviewId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding response:', error);
      return false;
    }
  };

  return {
    reviews,
    loading,
    fetchReviews,
    createReview,
    updateReview,
    markReviewHelpful,
    addResponse
  };
};
