import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

interface DeleteRoomError {
  message: string;
  statusCode?: number;
}

const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roomId: number): Promise<{ message: string }> => {
      console.log("useDeleteRoom: Deleting room with ID:", roomId);
      
      try {
        const { data } = await axiosInstance.delete(`/rooms/${roomId}`);
        console.log("useDeleteRoom: Delete successful:", data);
        return data;
      } catch (error) {
        console.error("useDeleteRoom: Delete failed:", error);
        
        const axiosError = error as AxiosError<{ message: string }>;
        
        if (axiosError.response?.data?.message) {
          throw {
            message: axiosError.response.data.message,
            statusCode: axiosError.response.status,
          } as DeleteRoomError;
        }
        
        // Fallback error messages
        if (axiosError.response?.status === 403) {
          throw {
            message: "Anda tidak memiliki akses untuk menghapus room ini",
            statusCode: 403,
          } as DeleteRoomError;
        }
        
        if (axiosError.response?.status === 404) {
          throw {
            message: "Room tidak ditemukan",
            statusCode: 404,
          } as DeleteRoomError;
        }
        
        if (axiosError.response?.status === 400) {
          throw {
            message: "Room tidak dapat dihapus karena masih memiliki booking aktif",
            statusCode: 400,
          } as DeleteRoomError;
        }
        
        throw {
          message: "Terjadi kesalahan saat menghapus room",
          statusCode: axiosError.response?.status || 500,
        } as DeleteRoomError;
      }
    },
    onSuccess: () => {
      // Invalidate tenant rooms queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["tenantRooms"] });
      console.log("useDeleteRoom: Successfully invalidated tenant rooms cache");
    },
    onError: (error: DeleteRoomError) => {
      console.error("useDeleteRoom: Mutation error:", error);
    },
  });
};

export default useDeleteRoom;