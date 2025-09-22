import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface RoomPayload {
  name: string;
  capacity: string; // String karena backend expect string dari DTO
  price: string; // String karena backend expect string dari DTO
  description: string;
  property: string; // slug / id
  limit: string; // String karena backend expect string dari DTO
  images?: File[];
  facilities?: { title: string }[]; // Tambah facilities support
}

const useCreateRoom = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (payload: RoomPayload | FormData) => {
    mutationFn: async (payload: RoomPayload | FormData) => {
      if (!session?.user.accessToken) {
        throw new Error("Access token is missing or expired");
      }

      let form: FormData;

      if (payload instanceof FormData) {
        form = payload;
      } else {
        form = new FormData();
        form.append("name", payload.name);
        form.append("capacity", payload.capacity); // Kirim sebagai string
        form.append("price", payload.price); // Kirim sebagai string
        form.append("description", payload.description);
        form.append("property", payload.property);
        form.append("limit", payload.limit); // Kirim sebagai string

        // Handle images
        if (payload.images && payload.images.length > 0) {
          payload.images.forEach((file) => {
            form.append("images", file);
          });
        }

        // Handle facilities
        if (payload.facilities && payload.facilities.length > 0) {
          payload.facilities.forEach((facility, index) => {
            form.append(`facilities[${index}][title]`, facility.title);
          });
        }
      }

      try {
        // Fix: endpoint harus '/room' bukan '/rooms'
        const response = await axiosInstance.post("/rooms", form, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
            // Content-Type akan di-set otomatis untuk FormData
          },
        });

        return response.data;
      } catch (error) {
        console.error("Error creating room:", error);
        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log("Room created successfully:", data);
      
      // Gunakan toast notification yang lebih baik
      toast.success("Room created successfully!");
      
      // Invalidate related queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["rooms"] }),
        queryClient.invalidateQueries({ queryKey: ["properties"] }), // Juga invalidate properties
      ]);

      // Navigate to dashboard atau room detail
      router.push("/dashboard");
    },
    onError: (error: AxiosError<{ message?: string; code?: number; errors?: Record<string, string[]> }>) => {
      console.error("Error creating room:", error);
      
      let errorMessage = "Failed to create room. Please try again.";

      if (error.response?.data) {
        const { message, errors } = error.response.data;
        const statusCode = error.response.status;
        
        if (statusCode === 400 && message?.toLowerCase().includes("property")) {
          errorMessage = "Invalid property selected. Please choose a different property.";
        } else if (statusCode === 400 && message?.toLowerCase().includes("validation")) {
          errorMessage = "Please check all required fields and try again.";
        } else if (statusCode === 401) {
          errorMessage = "You need to log in to create rooms.";
        } else if (statusCode === 403) {
          errorMessage = "You don't have permission to create rooms.";
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
  });
};

export default useCreateRoom;
