import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import { CreateReviewDTO } from '@/types/review';

export const useCreateReview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const session = useSession();

  const createReview = async (data: CreateReviewDTO) => {
    setLoading(true);
    setError(null);

    try {
      if (!session.data?.user?.accessToken) {
        throw new Error('Authentication required');
      }

      const response = await axiosInstance.post('/review/create', data, {
        headers: { Authorization: `Bearer ${session.data.user.accessToken}` }
      });

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);

      if (err.response?.status === 401) {
        router.push('/login');
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createReview, loading, error };
};