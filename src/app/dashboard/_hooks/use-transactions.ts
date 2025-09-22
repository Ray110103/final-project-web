// src/hooks/use-transactions.ts
import { useState, useEffect } from 'react';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import { Transaction, TransactionStatus, TransactionsResponse } from '@/types/transaction';

interface UseGetTransactionsOptions {
  enabled?: boolean;
  role?: 'user' | 'tenant';
}

interface GetTransactionsParams {
  page?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  orderNumber?: string;
  date?: string;
}

export const useGetTransactions = (
  params: GetTransactionsParams = {}, 
  options: UseGetTransactionsOptions = { enabled: true, role: 'user' }
) => {
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const session = useSession();
  const status = session.status; // 'loading' | 'authenticated' | 'unauthenticated'

  const { enabled, role } = options;

  const fetchData = async () => {
    if (!enabled) return;
    // Wait until session is resolved
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const accessToken = session.data?.user?.accessToken;
      if (!accessToken) {
        // Do not error loudly during initial load; rely on status redirects
        setError('Authentication required');
        return;
      }

      // Determine endpoint based on role
      const endpoint = role === 'tenant' ? '/transactions' : '/transactions/user';

      const response = await axiosInstance.get<TransactionsResponse>(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
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
      if (err.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params), enabled, role, status, session.data?.user?.accessToken]);

  // Function to manually refetch data
  const refetch = () => {
    fetchData();
  };

  // Function to update local data without refetching
  const updateLocalData = (updatedTransaction: Transaction) => {
    if (!data) return;
    
    const updatedData = {
      ...data,
      data: data.data.map(transaction => 
        transaction.id === updatedTransaction.id ? updatedTransaction : transaction
      )
    };
    
    setData(updatedData);
  };

  // Function to remove a transaction from local data
  const removeLocalTransaction = (transactionId: number) => {
    if (!data) return;
    
    const updatedData = {
      ...data,
      data: data.data.filter(transaction => transaction.id !== transactionId),
      meta: {
        ...data.meta,
        total: data.meta.total - 1
      }
    };
    
    setData(updatedData);
  };

  return { 
    data, 
    loading, 
    error, 
    refetch,
    updateLocalData,
    removeLocalTransaction
  };
};

// Hook for tenant transactions
export const useGetTenantTransactions = (params: GetTransactionsParams = {}) => {
  return useGetTransactions(params, { enabled: true, role: 'tenant' });
};

// Hook for user transactions
export const useGetUserTransactions = (params: GetTransactionsParams = {}) => {
  return useGetTransactions(params, { enabled: true, role: 'user' });
};