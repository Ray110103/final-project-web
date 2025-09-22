// _hooks/useRegister.ts
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

const useRegister = () => {
  return useMutation({
    mutationFn: async (payload: Payload) => {
      try {
        const { data } = await axiosInstance.post("/auth/register", payload);
        return data;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data) => {
      // Tampilkan pesan sukses untuk register biasa
      toast.success(
        data?.message || "Registrasi berhasil! Silakan cek email untuk verifikasi."
      );
      return data;
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Registration error:", error);
      
      // Handle network errors
      if (!error.response) {
        toast.error("Koneksi bermasalah. Periksa internet Anda dan coba lagi.");
        return;
      }

      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          // Bad request - validation errors
          if (data?.errors) {
            // Handle validation errors from backend
            const errorMessages = Object.entries(data.errors)
              .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
              .join('\n');
            toast.error(`Data tidak valid:\n${errorMessages}`);
          } else {
            toast.error(data?.message || "Email sudah terdaftar atau data tidak valid");
          }
          break;
          
        case 401:
          // Unauthorized
          toast.error("Tidak memiliki akses. Silakan coba lagi.");
          break;
          
        case 409:
          // Conflict - email already exists
          toast.error("Email sudah terdaftar. Silakan login atau gunakan email lain.");
          break;
          
        case 422:
          // Unprocessable entity - validation failed
          toast.error("Format email atau password tidak valid.");
          break;
          
        case 429:
          // Too many requests
          toast.error("Terlalu banyak percobaan registrasi. Tunggu beberapa menit.");
          break;
          
        case 500:
        case 502:
        case 503:
          // Server errors
          toast.error("Server sedang bermasalah. Silakan coba lagi dalam beberapa menit.");
          break;
          
        default:
          toast.error(
            data?.message || 
            "Terjadi kesalahan saat registrasi. Silakan coba lagi."
          );
      }
    },
  });
};

export default useRegister;