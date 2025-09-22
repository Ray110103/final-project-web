import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

const useDeleteProperty = () => {
  return useMutation({
    mutationFn: async (slug: string) => {
      // Check for token first
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      
      if (!token) {
        throw new Error("Token tidak ditemukan, silakan login kembali.");
      }

      // Use correct endpoint path - matching backend route
      const { data } = await axiosInstance.delete(`/property/${slug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data;
    },
    
    onError: (error: any) => {
      console.error("Delete property error:", error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        window.location.href = "/login";
        throw new Error("Session expired, silakan login kembali.");
      }
      
      throw new Error(error.response?.data?.message || "Gagal menghapus properti");
    },
    
    onSuccess: (data) => {
      console.log("Property successfully deleted:", data);
    },
  });
};

export default useDeleteProperty;