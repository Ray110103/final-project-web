// hooks/useSeasonalRates.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { PageableResponse } from "@/types/pagination";
import { 
  SeasonalRate, 
  CreateSeasonalRatePayload, 
  UpdateSeasonalRatePayload, 
  SeasonalRateSearchParams,
  SeasonalRateError 
} from "@/types/seasonal-rate";
import { AxiosError } from "axios";
import { toast } from "sonner";

// Get seasonal rates with comprehensive error handling
export const useGetSeasonalRates = (queries?: SeasonalRateSearchParams) => {
  return useQuery<PageableResponse<SeasonalRate>, SeasonalRateError>({
    queryKey: ["seasonalRates", queries],
    queryFn: async () => {
      try {
        console.log("useGetSeasonalRates: Starting request with queries:", queries);
        
        const params: Record<string, any> = {};
        if (queries) {
          Object.entries(queries).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params[key] = value;
            }
          });
        }

        console.log("useGetSeasonalRates: Making request with params:", params);

        const { data } = await axiosInstance.get<PageableResponse<SeasonalRate>>(
          "/rooms/seasonal-rates", 
          { params }
        );

        console.log("useGetSeasonalRates: API response:", data);
        return data;

      } catch (error) {
        console.error("useGetSeasonalRates: API error:", error);
        
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
          const statusCode = axiosError.response.status;
          
          switch (statusCode) {
            case 401:
              throw {
                type: 'auth',
                message: 'Sesi Anda telah berakhir. Silakan login kembali.',
                statusCode: 401
              } as SeasonalRateError;
              
            case 403:
              throw {
                type: 'forbidden',
                message: 'Anda tidak memiliki akses untuk melihat seasonal rates.',
                statusCode: 403
              } as SeasonalRateError;
              
            case 404:
              throw {
                type: 'server',
                message: 'Layanan seasonal rates tidak tersedia.',
                statusCode: 404
              } as SeasonalRateError;
              
            case 500:
              throw {
                type: 'server',
                message: 'Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa saat.',
                statusCode: 500
              } as SeasonalRateError;
              
            default:
              throw {
                type: 'server',
                message: `Terjadi kesalahan (${statusCode}). Silakan coba lagi.`,
                statusCode
              } as SeasonalRateError;
          }
        } else if (axiosError.request) {
          throw {
            type: 'network',
            message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
          } as SeasonalRateError;
        } else {
          throw {
            type: 'unknown',
            message: 'Terjadi kesalahan yang tidak diketahui.',
          } as SeasonalRateError;
        }
      }
    },
    enabled: !!queries?.roomId, // Only run when roomId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      const seasonalError = error as SeasonalRateError;
      
      // Don't retry auth or forbidden errors
      if (seasonalError.type === 'auth' || seasonalError.type === 'forbidden') {
        return false;
      }
      
      // Don't retry other 4xx errors
      if (seasonalError.statusCode && seasonalError.statusCode >= 400 && seasonalError.statusCode < 500) {
        return false;
      }
      
      // Retry network and 5xx server errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};