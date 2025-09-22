import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Payload {
  oldPassword: string;
  newPassword: string;
}

interface ErrorResponse {
  message: string;
  code?: number;
}

const useChangePassword = () => {
  const session = useSession();
  const router = useRouter();

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { data } = await axiosInstance.patch<{ message: string }>(
        "profile/change-password",
        payload,
        {
          headers: {
            Authorization: `Bearer ${session.data?.user.accessToken}`,
          },
        },
      );
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Password berhasil diubah!");
      router.replace("/profile");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Change password error:", error);
      
      if (!error.response) {
        toast.error("Koneksi bermasalah. Silakan coba lagi.");
        return;
      }

      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          toast.error(data?.message || "Password lama tidak valid");
          break;
        case 401:
          toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
          break;
        case 403:
          toast.error("Anda tidak memiliki akses untuk mengubah password");
          break;
        case 422:
          toast.error("Password baru tidak memenuhi kriteria minimum");
          break;
        case 429:
          toast.error("Terlalu banyak percobaan. Tunggu beberapa menit.");
          break;
        case 500:
          toast.error("Server bermasalah. Silakan coba lagi nanti.");
          break;
        default:
          toast.error(data?.message || "Gagal mengubah password. Silakan coba lagi.");
      }
    },
  });
};

export default useChangePassword;