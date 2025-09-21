import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Payload {
  email: string;

}

const useForgotPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { data } = await axiosInstance.post<{ message: string }>(
        "/auth/forgot-password",
        payload
      );
      return data;
    },
    onSuccess: async (data) => {
      toast.success("Send email success, please check your inbox.");
      router.push("/");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? "Something went wrong!");
    },
  });
};

export default useForgotPassword;
