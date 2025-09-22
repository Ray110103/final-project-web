// hooks/useDeleteCategory.ts
import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      try {
        const response = await axiosInstance.delete(`/property/categories/${slug}`);
        return response.data;
      } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
      }
    },
    onSuccess: async () => {
      toast.success("Category deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: AxiosError<{ message?: string; code?: number }>) => {
      console.error("Error deleting category:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong while deleting the category.";
      toast.error(errorMessage);
    },
  });
};

export default useDeleteCategory;