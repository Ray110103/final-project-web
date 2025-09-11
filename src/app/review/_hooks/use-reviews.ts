// src/hooks/use-reviews.ts
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import { Review } from '@/types/review';

interface UseGetReviewsOptions {
  enabled?: boolean;
}

interface GetReviewsParams {
  page?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  propertyId?: number;
}

export const useGetReviews = (
  params: GetReviewsParams = {}, 
  options: UseGetReviewsOptions = { enabled: true }
) => {
  const [data, setData] = useState<{ data: Review[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const session = useSession();
  const { enabled } = options;

  const fetchData = async () => {
    if (!enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      if (!session.data?.user?.accessToken) {
        throw new Error('Authentication required');
      }
      
      const endpoint = params.propertyId 
        ? `/reviews/property/${params.propertyId}`
        : '/reviews/user';
      
      const response = await axiosInstance.get(endpoint, {
        headers: { Authorization: `Bearer ${session.data.user.accessToken}` },
        params: {
          page: params.page || 1,
          take: params.take || 20,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
          ...params
        }
      });
      
      setData(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      
      setError(errorMessage);
      
      // Redirect to login if authentication error
      if (err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(params), enabled]);

  // Function to manually refetch data
  const refetch = () => {
    fetchData();
  };

  // Function to update local data without refetching
  const updateLocalData = (updatedReview: Review) => {
    if (!data) return;
    
    const updatedData = {
      ...data,
      data: data.data.map(review => 
        review.id === updatedReview.id ? updatedReview : review
      )
    };
    
    setData(updatedData);
  };

  return { 
    data, 
    loading, 
    error, 
    refetch,
    updateLocalData
  };
};

// Hook for getting reviews by property
export const useGetPropertyReviews = (propertyId: number, params: GetReviewsParams = {}) => {
  return useGetReviews({ ...params, propertyId }, { enabled: true });
};

// Hook for getting user's reviews
export const useGetUserReviews = (params: GetReviewsParams = {}) => {
  return useGetReviews(params, { enabled: true });
};