// hooks/useGetCategories.ts
import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { PropertyCategory } from "@/types/category";

const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<PropertyCategory[]> => {
      try {
        const response = await axiosInstance.get("/property/categories");
        return response.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        
        // Handle specific error cases
        const axiosError = error as AxiosError<{ message?: string; code?: number }>;
        const errorMessage = axiosError.response?.data?.message;
        const statusCode = axiosError.response?.status;
        
        // Show appropriate error messages
        if (statusCode === 401) {
          toast.error("You need to log in to view categories.");
        } else if (statusCode === 403) {
          toast.error("You don't have permission to view categories.");
        } else if (statusCode === 404) {
          toast.error("Categories endpoint not found.");
        } else if (statusCode && statusCode >= 500) {
          toast.error("Server error. Please try again later.");
        } else if (!navigator.onLine) {
          toast.error("No internet connection. Please check your network.");
        } else if (errorMessage) {
          toast.error(errorMessage);
        } else {
          toast.error("Failed to load categories. Please try again.");
        }
        
        throw error;
      }
    },
    // Additional options for better UX
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
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    refetchOnMount: "always", // Always refetch when component mounts
  });
};

export default useGetCategories;