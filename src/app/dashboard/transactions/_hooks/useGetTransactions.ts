// hooks/useGetTransactions.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Transaction {
  id: number;
  uuid: string;
  userid: number;
  username: string;
  roomid: string;
  room: {
    id: string;
    name: string;
    property: {
      id: number;
      name: string;
      city: string;
      address?: string;
    };
  };
  qty: number;
  status: 'WAITING_FOR_PAYMENT' | 'WAITING_FOR_CONFIRMATION' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  total: number;
  startDate: string;
  endDate: string;
  paymentProof?: string;
  createdAt: string;
  updatedAt: string;
}

interface GetTransactionsParams {
  page?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
}

interface TransactionsResponse {
  data: Transaction[];
  meta: {
    page: number;
    take: number;
    total: number;
  };
}

export const useGetTransactions = (params: GetTransactionsParams = {}) => {
  const [data, setData] = useState<TransactionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get<TransactionsResponse>('transactions', {
        params: {
          page: 1,
          take: 20,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          ...params
        }
      });
      
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(params)]);

  return { data, loading, error, refetch: fetchData };
};