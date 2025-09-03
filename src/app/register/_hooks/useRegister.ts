import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface Payload {
  name: string;
  email: string;
  password: string;
}

const useRegister = () => {
  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { data } = await axiosInstance.post("/auth/register", payload);
      return data;
    },
    onSuccess: (data) => {
      // tampilkan pesan dari backend
      toast.success(
        data?.message ??
          "Register success! Please check your email for verification."
      );
      // ❌ jangan langsung router.push("/login")
      // ✅ biarkan user klik link di email untuk verifikasi dulu
    },
    onError: (error: AxiosError<{ message: string; code: number }>) => {
      toast.error(error.response?.data.message ?? "Something went wrong!");
    },
  });
};

export default useRegister;
