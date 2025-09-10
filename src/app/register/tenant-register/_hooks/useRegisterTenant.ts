import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Payload {
  name: string;
  email: string;
  password: string;
}

const useRegisterTenant = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { data } = await axiosInstance.post("/auth/register/tenant", payload);
      return data;
    },
    onSuccess: () => {
      toast.success("sign up success");
      router.push("/login")
    },
    onError: (error: AxiosError<{ message: string}>) => {
      toast.error(error.response?.data?.message ?? "Something went wrong");
    },
  });
};

export default useRegisterTenant;
