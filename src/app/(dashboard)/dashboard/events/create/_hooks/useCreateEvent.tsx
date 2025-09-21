import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Payload {
  title: string;
  category: string;
  description: string;
  thumbnail: File | null;
}

const useCreateEvent = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const form = new FormData();
      form.append("thumbnail", payload.thumbnail!);
      form.append("title", payload.title);
      form.append("category", payload.category);
      form.append("description", payload.description);

      if (payload.thumbnail) {
        form.append("thumbnail", payload.thumbnail);
      }

      await axiosInstance.post("/events", form, {
        headers: { Authorization: `Bearer ${session.data?.user.accessToken}` },
      });
    },
    onSuccess: async () => {
      alert("create event success");
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      router.push("/");
    },
    onError: (error: AxiosError<{ message: string; code: number }>) => {
      alert(error.response?.data.message ?? "Something went wrong!");
    },
  });
};

export default useCreateEvent;
