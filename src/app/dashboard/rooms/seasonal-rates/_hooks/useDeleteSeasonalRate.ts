// hooks/useDeleteSeasonalRate.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const useDeleteSeasonalRate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      try {
        console.log("useDeleteSeasonalRate: Deleting seasonal rate with ID:", id);
        
        // Validate ID
        if (!id || id <= 0) {
          throw new Error("Invalid seasonal rate ID");
        }
        
        const { data } = await axiosInstance.delete(`/rooms/seasonal-rates/${id}`);
        
        console.log("useDeleteSeasonalRate: Success response:", data);
        return data;
        
      } catch (error) {
        console.error("useDeleteSeasonalRate: Error:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log("useDeleteSeasonalRate: Mutation successful", data);
      
      // Invalidate and refetch seasonal rates queries
      queryClient.invalidateQueries({ 
        queryKey: ["seasonalRates"] 
      });
      
      // Success toast is handled in the component
    },
    onError: (error: any, variables) => {
      console.error("useDeleteSeasonalRate: Mutation error:", error);
      
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        const statusCode = axiosError.response.status;
        const errorData = axiosError.response.data as any;
        
        switch (statusCode) {
          case 400:
            const message = errorData?.message || "Permintaan tidak valid";
            
            if (message.includes("active booking")) {
              toast.error("Tidak dapat menghapus seasonal rate yang sedang digunakan untuk booking aktif.");
            } else if (message.includes("future booking")) {
              toast.error("Tidak dapat menghapus seasonal rate yang akan digunakan untuk booking di masa depan.");
            } else {
              toast.error(`Penghapusan gagal: ${message}`);
            }
            break;
            
          case 401:
            toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
            break;
            
          case 403:
            toast.error("Anda tidak memiliki akses untuk menghapus seasonal rate ini.");
            break;
            
          case 404:
            toast.error("Seasonal rate tidak ditemukan atau sudah dihapus sebelumnya.");
            break;
            
          case 409:
            toast.error("Seasonal rate tidak dapat dihapus karena sedang digunakan untuk booking aktif.");
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
        // Handle client-side validation errors
        if (axiosError.message.includes("Invalid seasonal rate ID")) {
          toast.error("ID seasonal rate tidak valid.");
        } else {
          toast.error(`Error: ${axiosError.message}`);
        }
      } else {
        toast.error("Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.");
      }
    },
    retry: (failureCount, error) => {
      const axiosError = error as AxiosError;
      
      // Don't retry client errors (4xx) except for network timeouts
      if (axiosError.response && axiosError.response.status >= 400 && axiosError.response.status < 500) {
        return false;
      }
      
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};