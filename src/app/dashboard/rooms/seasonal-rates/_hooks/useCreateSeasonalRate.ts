// hooks/useCreateSeasonalRate.ts - SIMPLIFIED VERSION
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { CreateSeasonalRatePayload } from "@/types/seasonal-rate";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const useCreateSeasonalRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSeasonalRatePayload) => {
      console.log("Creating seasonal rate with payload:", payload);
      const response = await axiosInstance.post("/rooms/seasonal-rates", payload);
      console.log("Success response:", response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log("Create mutation successful:", data);
      queryClient.invalidateQueries({ queryKey: ["seasonalRates"] });
    },
    onError: (error: AxiosError) => {
      console.error("Create mutation failed:", error);
      
      if (error.response) {
        const statusCode = error.response.status;
        const errorData = error.response.data as any;
        
        console.error("Response error:", { statusCode, errorData });
        
        switch (statusCode) {
          case 400:
            toast.error("Data tidak valid. Silakan periksa input Anda.");
            break;
          case 401:
            toast.error("Sesi berakhir. Silakan login kembali.");
            break;
          case 403:
            toast.error("Tidak memiliki akses untuk membuat seasonal rate.");
            break;
          case 404:
            toast.error("Room tidak ditemukan.");
            break;
          case 409:
            toast.error("Tanggal bertumpang tindih dengan seasonal rate yang sudah ada.");
            break;
          case 500:
            toast.error("Kesalahan server. Silakan coba lagi.");
            break;
          default:
            toast.error(`Terjadi kesalahan (${statusCode}).`);
        }
      } else if (error.request) {
        console.error("Network error");
        toast.error("Tidak dapat terhubung ke server.");
      } else {
        console.error("Client error:", error.message);
        toast.error(`Error: ${error.message}`);
      }
    },
    retry: false, // Disable retry untuk debugging
  });
};