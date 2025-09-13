import { axiosInstance } from "@/lib/axios"; // pastikan ini konsisten
import { Room } from "@/types/room";

export const getRoomByProperty = async (propertyId: number): Promise<Room[]> => {
  try {
    const res = await axiosInstance.get(`/rooms?property=${propertyId}`);
    return res.data.data as Room[];
  } catch (error) {
    console.error("Failed to fetch room", error);
    return [];
  }
};
