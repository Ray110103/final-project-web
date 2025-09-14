// src/hooks/use-properties.ts
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import { Property } from '@/types/property';

interface UseGetPropertiesOptions {
  enabled?: boolean;
}

interface GetPropertiesParams {
  page?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  city?: string;
  category?: string;
}

export const useGetProperties = (
  params: GetPropertiesParams = {}, 
  options: UseGetPropertiesOptions = { enabled: true }
) => {
  const [data, setData] = useState<{ data: Property[] } | null>(null);
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
      const response = await axiosInstance.get('/property', {
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

  return { 
    data, 
    loading, 
    error, 
    refetch
  };
};