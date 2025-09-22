// _hooks/useResendEmailVerification.ts
import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const useResendEmailVerification = () => {
  const session = useSession();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post("/auth/resend-email-verification", {}, {
        headers: {
          Authorization: `Bearer ${session.data?.user.accessToken}`,
        },
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Verification email resent!");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to resend verification email");
    },
  });
};

export default useResendEmailVerification;