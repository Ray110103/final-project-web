import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface RoomPayload {
  name: string;
  capacity: number;
  price: number;
  description: string;
  property: string; // Changed from propertyId to property (slug)
  limit: number;
  thumbnail?: File | null; // optional, if you add image upload later
}

const useCreateRoom = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (payload: RoomPayload) => {
      if (!session?.user.accessToken) {
        throw new Error("Access token is missing or expired");
      }

      // Use FormData for consistency with your backend
      const form = new FormData();
      form.append("name", payload.name);
      form.append("capacity", String(payload.capacity));
      form.append("price", String(payload.price));
      form.append("description", payload.description);
      form.append("property", payload.property); // This is the slug
      form.append("limit", String(payload.limit));

      if (payload.thumbnail) {
        form.append("thumbnail", payload.thumbnail);
      }

      // Debug log
      console.log("Creating room with payload:", {
        name: payload.name,
        capacity: payload.capacity,
        price: payload.price,
        description: payload.description,
        property: payload.property,
        limit: payload.limit
      });

      try {
        const response = await axiosInstance.post("/rooms", form, {
          headers: {
            Authorization: `Bearer ${session?.user.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        });

        return response.data;
      } catch (error) {
        console.error("Error creating room:", error);
        throw error;
      }
    },
    onSuccess: async () => {
      alert("Room created successfully!");
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      router.push("/dashboard");
    },
    onError: (error: AxiosError<{ message: string; code: number }>) => {
      console.error("Error creating room:", error);
      const errorMessage = error.response?.data?.message || "Something went wrong while creating the room.";
      alert(errorMessage);
    },
  });
};

export default useCreateRoom;