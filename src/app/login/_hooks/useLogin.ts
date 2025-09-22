import { User } from "@/types/user";
import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface LoginPayload {
  email: string;
  password: string;
}

interface LoginResponse extends User {
  accessToken: string;
}

const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await axiosInstance.post<LoginResponse>("/auth/login", payload);
      return data;
    },
    onSuccess: async (data) => {
      // Store token consistently
      if (data.accessToken) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("access_token", data.accessToken);
      }
      
      await signIn("credentials", { 
        ...data, 
        accessToken: data.accessToken, // Pass accessToken explicitly
        redirect: false 
      });
      
      toast.success("Login berhasil");
      router.replace("/dashboard");
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("Login error:", error);
      toast.error(error.response?.data.message ?? "Login gagal!");
    },
  });
};

export default useLogin;