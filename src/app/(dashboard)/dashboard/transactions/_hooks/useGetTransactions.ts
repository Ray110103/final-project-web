// hooks/useGetTransactions.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  pictureProfile: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  id: number;
  uuid: string;
  userId: number;
  username: string;
  roomId: number;
  qty: number;
  status: 'WAITING_FOR_PAYMENT' | 'WAITING_FOR_CONFIRMATION' | 'PAID' | 'CANCELLED' | 'EXPIRED';
  total: number;
  startDate: string;
  endDate: string;
  paymentProof: string | null;
  invoice_url: string | null;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
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

  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();


  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get<TransactionsResponse>('/transactions', {
        headers: { Authorization: `Bearer ${session.data?.user.accessToken}` },
        params: {
          page: 1,
          take: 20,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          ...params
        }
      });
      console.log(response.data);
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