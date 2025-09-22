import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import { Property } from "@/types/property";
import { toast } from "sonner";

const useGetProperty = (slug: string) => {
  return useQuery({
    queryKey: ["property", slug],
    queryFn: async (): Promise<Property> => {
      try {
        const response = await axiosInstance.get(`/property/${slug}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching property:", error);
        
        // Handle specific error cases
        const axiosError = error as AxiosError<{ message?: string; code?: number }>;
        const errorMessage = axiosError.response?.data?.message;
        const statusCode = axiosError.response?.status;
        
        // Show appropriate error messages
        if (statusCode === 404) {
          toast.error("Property not found.");
        } else if (statusCode === 401) {
          toast.error("You need to log in to view this property.");
        } else if (statusCode === 403) {
          toast.error("You don't have permission to view this property.");
        } else if (statusCode && statusCode >= 500) {
          toast.error("Server error. Please try again later.");
        } else if (!navigator.onLine) {
          toast.error("No internet connection. Please check your network.");
        } else if (errorMessage) {
          toast.error(errorMessage);
        } else {
          toast.error("Failed to load property. Please try again.");
        }
        
        throw error;
      }
    },
    enabled: !!slug, // Only run query if slug is provided
    retry: (failureCount, error) => {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status;
      
      // Don't retry for client errors (4xx), but retry for network/server errors
      if (statusCode && statusCode >= 400 && statusCode < 500) {
        return false;
      }
      
      // Retry up to 3 times for network/server errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export default useGetProperty;