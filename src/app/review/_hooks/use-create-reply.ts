import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import { CreateReplyDTO } from '@/types/review';

export const useCreateReply = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const session = useSession();

  const createReply = async (data: CreateReplyDTO) => {
    setLoading(true);
    setError(null);

    try {
      if (!session.data?.user?.accessToken) {
        throw new Error('Authentication required');
      }

      const response = await axiosInstance.post('/review/reply', data, {
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

  return { createReply, loading, error };
};