import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Payload {
  title: string;
  category: string;
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
      form.append("category", payload.category);
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
          form.append("images", image); // ✅ Changed from "propertyImages" to "images"
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
      // Success notification - replace alert with your preferred toast/notification system
      console.log("Property created successfully:", data);
      
      // You can use a toast library like react-hot-toast or sonner instead
      alert("Property created successfully!");
      
      // Invalidate and refetch property queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["property"] }),
        queryClient.invalidateQueries({ queryKey: ["properties"] }), // In case you have a list query
      ]);

      // Navigate to success page - adjust route as needed
      router.push("/"); // or `/properties/${data.id}` if you want to go to the created property
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      console.error("Property creation failed:", error);

      let errorMessage = "Failed to create property. Please try again.";

      if (error.response?.data) {
        const { message, errors } = error.response.data;
        
        if (message) {
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

      // Replace with your preferred notification system
      alert(errorMessage);
      
      // Optional: You could also show a more user-friendly error UI
      // toast.error(errorMessage);
    },

    // Optional: Add retry logic for network errors
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof AxiosError && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
        return false;
      }
      // Retry up to 3 times for network/server errors
      return failureCount < 3;
    },

    // Optional: Add retry delay
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export default useCreateProperty;