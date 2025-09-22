// _hooks/useGetLocation.ts - COMPLETE UPDATED VERSION
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import { Property } from "@/types/property";

interface LocationOption {
  location: string;
  city: string;
  count: number;
}

interface PropertyResponse {
  data: Property[];
  meta: {
    page: number;
    take: number;
    total: number;
  };
}

const useGetLocations = () => {
  return useQuery<LocationOption[], Error>({
    queryKey: ["locations"],
    queryFn: async (): Promise<LocationOption[]> => {
      console.log("useGetLocations: Starting location fetch...");
      
      try {
        // Try the dedicated endpoint first
        console.log("useGetLocations: Trying dedicated endpoint /property/locations");
        const response = await axiosInstance.get("/property/locations");
        console.log("useGetLocations: Dedicated endpoint success:", response.data);
        return response.data as LocationOption[];
      } catch (error) {
        console.error("useGetLocations: Dedicated endpoint failed:", error);
        
        const axiosError = error as AxiosError;
        
        // If it's a 404 (endpoint not found), try fallback
        if (axiosError.response?.status === 404) {
          console.log("useGetLocations: Endpoint not found, trying fallback method");
          
          try {
            const response = await axiosInstance.get<PropertyResponse>("/property", {
              params: {
                take: 1000, // Get many properties to capture all locations
              }
            });
            
            console.log("useGetLocations: Fallback properties response:", response.data);
            
            const properties = response.data.data || [];
            
            if (properties.length === 0) {
              console.log("useGetLocations: No properties found");
              return [];
            }
            
            // Group by location and city, count occurrences
            const locationMap = new Map<string, LocationOption>();
            
            properties.forEach((property: Property) => {
              const key = `${property.location}-${property.city}`;
              
              if (locationMap.has(key)) {
                const existing = locationMap.get(key)!;
                locationMap.set(key, {
                  ...existing,
                  count: existing.count + 1
                });
              } else {
                locationMap.set(key, {
                  location: property.location,
                  city: property.city,
                  count: 1
                });
              }
            });
            
            const result = Array.from(locationMap.values())
              .sort((a, b) => b.count - a.count);
              
            console.log("useGetLocations: Fallback method success:", result);
            return result;
            
          } catch (fallbackError) {
            console.error("useGetLocations: Fallback method also failed:", fallbackError);
            throw fallbackError;
          }
        } else {
          // For other errors (like 400, 500), don't try fallback
          console.error("useGetLocations: Non-404 error, not trying fallback");
          throw error;
        }
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount: number, error: Error) => {
      const axiosError = error as AxiosError;
      const statusCode = axiosError.response?.status;
      
      console.log(`useGetLocations: Retry attempt ${failureCount}, status: ${statusCode}`);
      
      // Don't retry for client errors (4xx)
      if (statusCode && statusCode >= 400 && statusCode < 500) {
        return false;
      }
      
      return failureCount < 3;
    },
    // Fail silently - if locations can't be loaded, the form should still work
    throwOnError: false,
  });
};

export default useGetLocations;