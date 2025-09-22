// _hooks/useGetProperties.ts - COMPLETE UPDATED VERSION
import { PageableResponse, PaginationQueries } from "@/types/pagination";
import { Property } from "@/types/property";
import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface GetPropertyQuery extends PaginationQueries {
  search?: string;
  category?: string;
  location?: string;
  destination?: string;
  checkInDate?: string;
  checkOutDate?: string;
  capacity?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string;
}

const useGetProperties = (queries?: GetPropertyQuery) => {
  return useQuery({
    queryKey: ["properties", queries],
    queryFn: async () => {
      console.log("useGetProperties: Query parameters:", queries);
      
      // Clean and prepare parameters
      const params: Record<string, any> = {};
      
      // Add only defined and non-empty values
      if (queries) {
        Object.entries(queries).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            // Special handling for capacity - convert to string
            if (key === 'capacity') {
              params[key] = value.toString();
            } else {
              params[key] = value;
            }
          }
        });
      }
      
      console.log("useGetProperties: Final params sent to API:", params);
      
      try {
        const { data } = await axiosInstance.get<PageableResponse<Property>>(
          "/property",
          { params },
        );
        
        console.log("useGetProperties: API response:", data);
        console.log(`useGetProperties: Found ${data.data?.length || 0} properties out of ${data.meta?.total || 0} total`);
        
        return data;
      } catch (error) {
        console.error("useGetProperties: API error:", error);
        throw error;
      }
    },
    // Enable query when we have at least some parameters or want to fetch all
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export default useGetProperties;