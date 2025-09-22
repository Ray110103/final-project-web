import { PageableResponse, PaginationQueries } from "@/types/pagination";
import { Room, RoomSearchParams } from "@/types/room";
import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface GetTenantRoomsQuery extends PaginationQueries {
  property?: string; // property slug or ID
  name?: string;
  capacity?: number;
  checkInDate?: string;
  checkOutDate?: string;
}

interface TenantRoomsError {
  type: 'auth' | 'network' | 'server' | 'forbidden' | 'unknown';
  message: string;
  statusCode?: number;
}

const useGetTenantRooms = (queries?: GetTenantRoomsQuery) => {
  return useQuery<PageableResponse<Room>, TenantRoomsError>({
    queryKey: ["tenantRooms", queries],
    queryFn: async () => {
      console.log("useGetTenantRooms: Starting request with queries:", queries);
      
      try {
        // Clean and prepare parameters
        const params: Record<string, any> = {};
        if (queries) {
          Object.entries(queries).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              params[key] = value;
            }
          });
        }

        console.log("useGetTenantRooms: Making request with params:", params);

        const { data } = await axiosInstance.get<PageableResponse<Room>>(
          "/rooms/tenant", // Updated endpoint sesuai dengan router yang sudah diperbaiki
          { params }
        );

        console.log("useGetTenantRooms: API response:", data);

        return data;

      } catch (error) {
        console.error("useGetTenantRooms: API error:", error);
        
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
          const statusCode = axiosError.response.status;
          
          switch (statusCode) {
            case 401:
              throw {
                type: 'auth',
                message: 'Sesi Anda telah berakhir. Halaman akan dimuat ulang.',
                statusCode: 401
              } as TenantRoomsError;
              
            case 403:
              throw {
                type: 'forbidden',
                message: 'Anda tidak memiliki akses untuk melihat room tenant. Pastikan akun Anda memiliki role tenant.',
                statusCode: 403
              } as TenantRoomsError;
              
            case 404:
              throw {
                type: 'server',
                message: 'Layanan room tenant tidak tersedia. Silakan hubungi administrator.',
                statusCode: 404
              } as TenantRoomsError;
              
            case 500:
              throw {
                type: 'server',
                message: 'Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa saat.',
                statusCode: 500
              } as TenantRoomsError;
              
            default:
              throw {
                type: 'server',
                message: `Terjadi kesalahan (${statusCode}). Silakan coba lagi.`,
                statusCode
              } as TenantRoomsError;
          }
        } else if (axiosError.request) {
          throw {
            type: 'network',
            message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
          } as TenantRoomsError;
        } else {
          throw {
            type: 'unknown',
            message: 'Terjadi kesalahan yang tidak diketahui. Silakan muat ulang halaman.',
          } as TenantRoomsError;
        }
      }
    },
    enabled: !!queries?.property, // Only run query when property is selected
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      const tenantError = error as TenantRoomsError;
      
      // Don't retry auth or forbidden errors
      if (tenantError.type === 'auth' || tenantError.type === 'forbidden') {
        return false;
      }
      
      // Don't retry other 4xx errors
      if (tenantError.statusCode && tenantError.statusCode >= 400 && tenantError.statusCode < 500) {
        return false;
      }
      
      // Retry network and 5xx server errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export default useGetTenantRooms;