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
  property: string; // slug / id
  limit: number;
  images?: File[];
}

const useCreateRoom = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (payload: RoomPayload | FormData) => {
      if (!session?.user.accessToken) {
        throw new Error("Access token is missing or expired");
      }

      let form: FormData;

      if (payload instanceof FormData) {
        // ✅ Kalau dari component sudah kirim FormData langsung
        form = payload;
      } else {
        // ✅ Kalau masih berupa object, ubah ke FormData
        form = new FormData();
        form.append("name", payload.name);
        form.append("capacity", String(payload.capacity));
        form.append("price", String(payload.price));
        form.append("description", payload.description);
        form.append("property", payload.property);
        form.append("limit", String(payload.limit));

        if (payload.images && payload.images.length > 0) {
          payload.images.forEach((file) => {
            form.append("images", file);
          });
        }
      }

      try {
        const response = await axiosInstance.post("/rooms", form, {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
            // ❌ jangan set Content-Type manual, biar browser yang atur
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
    onError: (error: AxiosError<{ message?: string; code?: number }>) => {
      console.error("Error creating room:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong while creating the room.";
      alert(errorMessage);
    },
  });
};

export default useCreateRoom;
