// hooks/useUpdateSeasonalRate.ts - FINAL FIXED VERSION
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { UpdateSeasonalRatePayload } from "@/types/seasonal-rate";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const useUpdateSeasonalRate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: UpdateSeasonalRatePayload }) => {
      try {
        console.log("useUpdateSeasonalRate: Updating seasonal rate", id, "with payload:", payload);
        
        // Validate payload before sending
        if (!id || id <= 0) {
          throw new Error("Invalid seasonal rate ID");
        }
        
        // Validate dates if provided
        if (payload.startDate && payload.endDate) {
          if (new Date(payload.endDate) <= new Date(payload.startDate)) {
            throw new Error("End date must be after start date");
          }
        }
        
        // FIXED: Validate adjustment value if provided (string format)
        if (payload.adjustmentValue !== undefined && parseFloat(payload.adjustmentValue) <= 0) {
          throw new Error("Adjustment value must be greater than 0");
        }
        
        const { data } = await axiosInstance.put(`/rooms/seasonal-rates/${id}`, payload);
        
        console.log("useUpdateSeasonalRate: Success response:", data);
        return data;
        
      } catch (error) {
        console.error("useUpdateSeasonalRate: Error:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log("useUpdateSeasonalRate: Mutation successful", data);
      queryClient.invalidateQueries({ queryKey: ["seasonalRates"] });
    },
    onError: (error: any, variables) => {
      console.error("useUpdateSeasonalRate: Mutation error:", error);
      
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        const errorData = axiosError.response.data as any;
        
        switch (statusCode) {
          case 400:
            const message = errorData?.message || "Data yang diberikan tidak valid";
            if (message.includes("overlapping")) {
              toast.error("Update gagal: Seasonal rate akan bertumpang tindih dengan rate yang sudah ada.");
            } else if (message.includes("date")) {
              toast.error("Format tanggal tidak valid atau tanggal akhir harus setelah tanggal mulai.");
            } else if (message.includes("adjustment")) {
              toast.error("Nilai adjustment tidak valid. Pastikan nilai lebih besar dari 0.");
            } else {
              toast.error(`Validasi gagal: ${message}`);
            }
            break;
          case 401:
            toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
            break;
          case 403:
            toast.error("Anda tidak memiliki akses untuk mengubah seasonal rate ini.");
            break;
          case 404:
            toast.error("Seasonal rate tidak ditemukan atau sudah dihapus.");
            break;
          case 409:
            toast.error("Update gagal: Tanggal yang dipilih bertumpang tindih dengan seasonal rate lain.");
            break;
          case 500:
            toast.error("Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa saat.");
            break;
          default:
            toast.error(`Terjadi kesalahan (${statusCode}). Silakan coba lagi.`);
        }
      } else if (axiosError.request) {
        toast.error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.");
      } else if (axiosError.message) {
        if (axiosError.message.includes("Invalid seasonal rate ID")) {
          toast.error("ID seasonal rate tidak valid.");
        } else if (axiosError.message.includes("End date")) {
          toast.error("Tanggal akhir harus setelah tanggal mulai.");
        } else if (axiosError.message.includes("Adjustment value")) {
          toast.error("Nilai adjustment harus lebih besar dari 0.");
        } else {
          toast.error(`Error: ${axiosError.message}`);
        }
      } else {
        toast.error("Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.");
      }
    },
    retry: (failureCount, error) => {
      const axiosError = error as AxiosError;
      if (axiosError.response && axiosError.response.status >= 400 && axiosError.response.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};