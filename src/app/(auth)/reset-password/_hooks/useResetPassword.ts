import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Payload {
  password: string;
}

const useResetPassword = (token: string) => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { data } = await axiosInstance.patch<{ message: string }>(
        "/auth/reset-password",
        payload,
        {headers: {Authorization: `Bearer ${token}`}}
      );
      return data;
    },
    onSuccess: async (data) => {
      toast.success("reset password success");
      router.replace("/sign-in");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.log(error);
      toast.error(error.response?.data.message ?? "Something went wrong!");
    },
  });
};

export default useResetPassword;
