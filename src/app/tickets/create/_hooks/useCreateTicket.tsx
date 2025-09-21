import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface TicketPayload {
  title: string;
  event: string; 
  price: number; 
  limit: number;
  description: string;
}

const useCreateTicket = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (payload: TicketPayload) => {
      const form = new FormData();
      form.append("title", payload.title);
      form.append("event", payload.event);
      form.append("price", String(payload.price)); // convert to string
      form.append("limit", String(payload.limit)); // convert to string
      form.append("description", payload.description);

      const response = await axiosInstance.post("/tickets", form, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: async () => {
      alert("Create ticket success");
      await queryClient.invalidateQueries({ queryKey: ["tickets"] });
      router.push("/tickets");
    },
    onError: (error: AxiosError<{ message: string; code: number }>) => {
      alert(error.response?.data.message ?? "Something went wrong!");
    },
  });
};

export default useCreateTicket;