import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UpdateRoomPayload {
  name?: string;
  capacity?: string;
  price?: string;
  description?: string;
  property?: string; // property slug or ID
  limit?: string; // stock
  images?: File[];
  facilities?: { title: string }[];
}

interface ApiErrorResponse {
  message: string;
  code?: number;
  errors?: Record<string, string[]>; // For validation errors
}

const useUpdateRoom = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async ({ roomId, payload }: { roomId: number; payload: UpdateRoomPayload | FormData }) => {
      // Validate required session
      if (!session?.user?.accessToken) {
        throw new Error("Authentication required. Please log in.");
      }

      let form: FormData;

      if (payload instanceof FormData) {
        form = payload;
      } else {
        form = new FormData();
        
        // Add basic room data (only if provided)
        if (payload.name) form.append("name", payload.name);
        if (payload.capacity) form.append("capacity", payload.capacity);
        if (payload.price) form.append("price", payload.price);
        if (payload.description) form.append("description", payload.description);
        if (payload.property) form.append("property", payload.property);
        if (payload.limit) form.append("limit", payload.limit);

        // Add images (multiple files)
        if (payload.images && payload.images.length > 0) {
          payload.images.forEach((image) => {
            // Validate file type
            if (!image.type.startsWith('image/')) {
              throw new Error(`File ${image.name} is not a valid image`);
            }
            form.append("images", image);
          });
        }

        // Add facilities
        if (payload.facilities && payload.facilities.length > 0) {
          payload.facilities.forEach((facility, index) => {
            form.append(`facilities[${index}][title]`, facility.title);
          });
        }
      }

      const response = await axiosInstance.put(`/rooms/${roomId}`, form, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          // Don't set Content-Type manually - let browser set it for FormData
        },
      });

      return response.data;
    },

    onSuccess: async (data, { roomId }) => {
      console.log("Room updated successfully:", data);
      
      // Success notification
      toast.success("Room updated successfully!");
      
      // Invalidate and refetch room queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["tenantRooms"] }),
        queryClient.invalidateQueries({ queryKey: ["room"] }),
        queryClient.invalidateQueries({ queryKey: ["rooms"] }),
        // Invalidate specific room
        queryClient.invalidateQueries({ queryKey: ["roomForEdit", roomId] }),
      ]);

      // Navigate back to rooms list or dashboard
      router.push("/dashboard");
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      console.error("Room update failed:", error);

      let errorMessage = "Failed to update room. Please try again.";

      if (error.response?.data) {
        const { message, errors } = error.response.data;
        const statusCode = error.response.status;
        
        if (statusCode === 400 && message?.toLowerCase().includes("name already")) {
          errorMessage = "Room name already exists in this property. Please choose a different name.";
        } else if (statusCode === 400 && message?.toLowerCase().includes("capacity")) {
          errorMessage = "Invalid capacity value. Capacity must be a positive number.";
        } else if (statusCode === 400 && message?.toLowerCase().includes("stock")) {
          errorMessage = "Invalid stock value. Stock must be a positive number.";
        } else if (statusCode === 400 && message?.toLowerCase().includes("price")) {
          errorMessage = "Invalid price value. Price must be a positive number.";
        } else if (statusCode === 400 && message?.toLowerCase().includes("booking")) {
          errorMessage = "Cannot update room with active bookings. Please complete or cancel existing bookings first.";
        } else if (statusCode === 401) {
          errorMessage = "You need to log in to update rooms.";
        } else if (statusCode === 403) {
          errorMessage = "You don't have permission to update this room.";
        } else if (statusCode === 404) {
          errorMessage = "Room not found or you don't have access to it.";
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

export default useUpdateRoom;