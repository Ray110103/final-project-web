import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Payload {
  token: string;
  password: string;
}

const useVerifyEmail = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { data } = await axiosInstance.post("/auth/verify-email", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Email verified successfully! Please login.");
      router.push("/login");
    },
    onError: (error: AxiosError<{ message: string; code: number }>) => {
      toast.error(error.response?.data.message ?? "Verification failed!");
    },
  });
};

export default useVerifyEmail;
