import { axiosInstance } from "@/lib/axios";
import { User } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

interface Payload {
  email: string;
  password: string;
}

const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { data } = await axiosInstance.post<User>("/auth/login", payload);
      console.log(data)
      return data;
    },
    onSuccess: async (data) => {
      console.log(data)
      await signIn("credentials", { ...data, redirect: false });
      toast.success("sign in success");
       router.replace("/");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data.message ?? "Something went wrong!");
    },
  });
};

export default useLogin;
