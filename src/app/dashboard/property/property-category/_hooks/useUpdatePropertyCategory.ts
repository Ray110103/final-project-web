// hooks/useUpdateCategory.ts
import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface UpdateCategoryPayload {
  name?: string;
  isActive?: boolean;
}

interface UpdateCategoryParams {
  slug: string;
  data: UpdateCategoryPayload;
}

const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug, data }: UpdateCategoryParams) => {
      try {
        const response = await axiosInstance.put(`/property/categories/${slug}`, data);
        return response.data;
      } catch (error) {
        console.error("Error updating category:", error);
        throw error;
      }
    },
    onSuccess: async () => {
      toast.success("Category updated successfully!");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: AxiosError<{ message?: string; code?: number }>) => {
      console.error("Error updating category:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong while updating the category.";
      toast.error(errorMessage);
    },
  });
};

export default useUpdateCategory;