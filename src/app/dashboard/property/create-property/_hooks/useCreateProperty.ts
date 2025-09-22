import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Payload {
  title: string;
  category: string; // Using slug instead of categoryId
  description: string;
  city: string;
  address: string;
  location: string;
  latitude: string;
  longtitude: string; // Keep as-is since backend expects this spelling
  thumbnail?: File;
  propertyImages?: File[];
  facilities?: { title: string }[];
}

interface ApiErrorResponse {
  message: string;
  code?: number;
  errors?: Record<string, string[]>; // For validation errors
}

const useCreateProperty = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (payload: Payload) => {
      // Validate required session
      if (!session?.user?.accessToken) {
        throw new Error("Authentication required. Please log in.");
      }

      const form = new FormData();
      
      // Add basic property data
      form.append("title", payload.title);
      form.append("category", payload.category); // Send category slug
      form.append("location", payload.location);
      form.append("description", payload.description);
      form.append("city", payload.city);
      form.append("address", payload.address);
      form.append("latitude", payload.latitude);
      form.append("longtitude", payload.longtitude);

      // Add thumbnail if provided
      if (payload.thumbnail) {
        form.append("thumbnail", payload.thumbnail);
      }

      // Add property images (multiple files) - use "images" to match backend
      if (payload.propertyImages && payload.propertyImages.length > 0) {
        payload.propertyImages.forEach((image, index) => {
          // Validate file type (optional)
          if (!image.type.startsWith('image/')) {
            throw new Error(`File ${image.name} is not a valid image`);
          }
          form.append("images", image);
        });
      }

      // Add facilities - Send individual facility objects
      if (payload.facilities && payload.facilities.length > 0) {
        payload.facilities.forEach((facility, index) => {
          form.append(`facilities[${index}][title]`, facility.title);
        });
      }

      const response = await axiosInstance.post("/property", form, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          // Don't set Content-Type manually - let browser set it for FormData
        },
      });

      return response.data;
    },

    onSuccess: async (data) => {
      console.log("Property created successfully:", data);
      
      // Success notification
      toast.success("Property created successfully!");
      
      // Invalidate and refetch property queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["property"] }),
        queryClient.invalidateQueries({ queryKey: ["properties"] }),
        queryClient.invalidateQueries({ queryKey: ["categories"] }), // Also invalidate categories
      ]);

      // Navigate to dashboard or property detail page
      router.push("/dashboard");
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      console.error("Property creation failed:", error);

      let errorMessage = "Failed to create property. Please try again.";

      if (error.response?.data) {
        const { message, errors } = error.response.data;
        const statusCode = error.response.status;
        
        if (statusCode === 400 && message?.toLowerCase().includes("category")) {
          errorMessage = "Invalid category selected. Please choose a different category.";
        } else if (statusCode === 400 && message?.toLowerCase().includes("title already")) {
          errorMessage = "Property title already exists. Please choose a different title.";
        } else if (statusCode === 401) {
          errorMessage = "You need to log in to create properties.";
        } else if (statusCode === 403) {
          errorMessage = "You don't have permission to create properties.";
        } else if (statusCode && statusCode >= 500) {
          errorMessage = "Server error. Please try again later.";
        } else if (message) {
          errorMessage = message;
        } else if (errors) {
          // Handle validation errors
          const validationErrors = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n");
          errorMessage = `Validation errors:\n${validationErrors}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show error notification
      toast.error(errorMessage);
    },

    // Retry logic for network errors
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof AxiosError && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        return false;
      }
      // Retry up to 3 times for network/server errors
      return failureCount < 3;
    },

    // Retry delay with exponential backoff
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export default useCreateProperty;