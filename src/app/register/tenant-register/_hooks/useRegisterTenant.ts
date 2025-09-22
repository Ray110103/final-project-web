// _hooks/useRegisterTenant.ts
import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface Payload {
  name: string;
  email: string;
  password: string;
}

interface ErrorResponse {
  message: string;
  code?: number;
  errors?: Record<string, string[]>;
}

const useRegisterTenant = () => {
  return useMutation({
    mutationFn: async (payload: Payload) => {
      const { data } = await axiosInstance.post("/auth/register/tenant", payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        data?.message || "Registrasi tenant berhasil! Silakan cek email untuk verifikasi."
      );
      return data;
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Tenant registration error:", error);
      
      if (!error.response) {
        toast.error("Koneksi bermasalah. Silakan coba lagi.");
        return;
      }

      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          if (data?.errors) {
            const firstError = Object.values(data.errors)[0]?.[0];
            toast.error(firstError || "Data yang dimasukkan tidak valid");
          } else {
            toast.error(data?.message || "Email sudah terdaftar atau data tidak valid");
          }
          break;
        case 409:
          toast.error("Email sudah terdaftar. Silakan gunakan email lain atau login.");
          break;
        case 422:
          toast.error("Format data tidak valid. Periksa kembali informasi Anda.");
          break;
        case 429:
          toast.error("Terlalu banyak percobaan. Silakan tunggu beberapa saat.");
          break;
        case 500:
          toast.error("Server bermasalah. Silakan coba lagi nanti.");
          break;
        default:
          toast.error(data?.message || "Terjadi kesalahan saat mendaftar sebagai tenant");
      }
    },
  });
};

export default useRegisterTenant;