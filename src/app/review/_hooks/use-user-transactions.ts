import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import { Transaction } from '@/types/transaction';

export const useUserTransactions = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const session = useSession();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!session.data?.user?.accessToken) {
        throw new Error('Authentication required');
      }

      const response = await axiosInstance.get('/transactions/completed', {
        headers: { Authorization: `Bearer ${session.data.user.accessToken}` }
      });

      // Filter out transactions that don't have room or property
      const validTransactions = (response.data.data || []).filter(
        (t: Transaction) => t.room && t.room.property
      );

      setData(validTransactions);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);

      if (err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
};