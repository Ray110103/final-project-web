// hooks/useCreateCategory.ts
import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface CreateCategoryPayload {
  name: string;
  isActive?: boolean;
}

const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      try {
        const response = await axiosInstance.post("/property/categories", payload);
        return response.data;
      } catch (error) {
        console.error("Error creating category:", error);
        throw error;
      }
    },
    onSuccess: async () => {
      toast.success("Category created successfully!");
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error: AxiosError<{ message?: string; code?: number }>) => {
      console.error("Error creating category:", error);
      
      // Handle specific error cases
      const errorMessage = error.response?.data?.message;
      const statusCode = error.response?.status;
      
      if (statusCode === 400 && errorMessage?.toLowerCase().includes("already exists")) {
        toast.error("Category name already exists. Please choose a different name.");
      } else if (statusCode === 400 && errorMessage?.toLowerCase().includes("required")) {
        toast.error("Category name is required.");
      } else if (statusCode === 401) {
        toast.error("You need to log in to create categories.");
      } else if (statusCode === 403) {
        toast.error("You don't have permission to create categories.");
      } else if (statusCode && statusCode >= 500) {
        toast.error("Server error. Please try again later.");
      } else if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Failed to create category. Please try again.");
      }
    },
  });
};

export default useCreateCategory;