// _hooks/useUpdateEmail.ts
import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface UpdateEmailPayload {
  newEmail: string;
  password: string;
}

const useUpdateEmail = () => {
  const session = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateEmailPayload) => {
      const { data } = await axiosInstance.patch("/auth/update-email", payload, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Verification email sent to your new email address!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update email");
    },
  });
};

export default useUpdateEmail;