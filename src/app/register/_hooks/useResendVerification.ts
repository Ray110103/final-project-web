// _hooks/useResendVerification.ts
import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface Payload {
  email: string;
}

const useResendVerification = () => {
  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { data } = await axiosInstance.post("/auth/resend-verification", payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message ?? "Verification email resent! Please check your inbox.");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? "Failed to resend verification email");
    },
  });
};

export default useResendVerification;