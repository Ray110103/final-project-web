import { Room } from "@/types/room";
import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface RoomForEditError {
  type: 'auth' | 'network' | 'server' | 'forbidden' | 'not_found' | 'unknown';
  message: string;
  statusCode?: number;
}

const useGetRoomForEdit = (roomId: string | number) => {
  return useQuery<Room, RoomForEditError>({
    queryKey: ["roomForEdit", roomId],
    queryFn: async () => {
      console.log("useGetRoomForEdit: Fetching room with ID:", roomId);
      
      try {
        const { data } = await axiosInstance.get<Room>(`/rooms/${roomId}`);
        
        console.log("useGetRoomForEdit: API response:", data);
        return data;

      } catch (error) {
        console.error("useGetRoomForEdit: API error:", error);
        
        const axiosError = error as AxiosError;
        
        if (axiosError.response) {
          const statusCode = axiosError.response.status;
          
          switch (statusCode) {
            case 401:
              throw {
                type: 'auth',
                message: 'Sesi Anda telah berakhir. Silakan login kembali.',
                statusCode: 401
              } as RoomForEditError;
              
            case 403:
              throw {
                type: 'forbidden',
                message: 'Anda tidak memiliki akses untuk mengedit room ini. Pastikan room ini milik properti Anda.',
                statusCode: 403
              } as RoomForEditError;
              
            case 404:
              throw {
                type: 'not_found',
                message: 'Room tidak ditemukan atau telah dihapus.',
                statusCode: 404
              } as RoomForEditError;
              
            case 500:
              throw {
                type: 'server',
                message: 'Terjadi kesalahan pada server. Silakan coba lagi dalam beberapa saat.',
                statusCode: 500
              } as RoomForEditError;
              
            default:
              throw {
                type: 'server',
                message: `Terjadi kesalahan (${statusCode}). Silakan coba lagi.`,
                statusCode
              } as RoomForEditError;
          }
        } else if (axiosError.request) {
          throw {
            type: 'network',
            message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.',
          } as RoomForEditError;
        } else {
          throw {
            type: 'unknown',
            message: 'Terjadi kesalahan yang tidak diketahui. Silakan muat ulang halaman.',
          } as RoomForEditError;
        }
      }
    },
    enabled: !!roomId, // Only run when roomId is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      const roomError = error as RoomForEditError;
      
      // Don't retry auth, forbidden, or not found errors
      if (roomError.type === 'auth' || roomError.type === 'forbidden' || roomError.type === 'not_found') {
        return false;
      }
      
      // Don't retry other 4xx errors
      if (roomError.statusCode && roomError.statusCode >= 400 && roomError.statusCode < 500) {
        return false;
      }
      
      // Retry network and 5xx server errors up to 3 times
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export default useGetRoomForEdit;