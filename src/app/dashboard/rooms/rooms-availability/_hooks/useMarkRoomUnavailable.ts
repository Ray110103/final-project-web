// useMarkRoomUnavailable.ts (NEW HOOK)
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface MarkUnavailablePayload {
  roomId: number;
  date: string; // ISO date string
  reason: string;
}

interface MarkUnavailableResponse {
  message: string;
  data: {
    id: number;
    roomId: number;
    date: string;
    reason: string;
    createdAt: string;
    updatedAt: string;
  };
}

const useMarkRoomUnavailable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: MarkUnavailablePayload) => {
      const { data } = await axiosInstance.post<MarkUnavailableResponse>(
        "/room/non-availability",
        payload
      );
      return data;
    },
    onSuccess: (data, variables) => {
      toast.success("Room marked as unavailable successfully");
      
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ 
        queryKey: ["rooms"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["room", variables.roomId] 
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      console.error("Mark room unavailable error:", error);
      
      if (error.response?.status === 404) {
        toast.error("Room not found or you don't have access to this room");
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data.message ?? "Invalid request");
      } else if (error.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else if (error.response?.status === 403) {
        toast.error("Access denied - you don't have permission to modify this room");
      } else {
        toast.error(error.response?.data.message ?? "Failed to mark room as unavailable");
      }
    },
  });
};

export default useMarkRoomUnavailable;