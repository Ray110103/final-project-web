"use server";

import { User } from "@/types/user";
import { axiosInstance } from "@/lib/axios";
import { revalidatePath } from "next/cache";

export const updateUser = async (formData: FormData): Promise<User> => {
  try {
    const response = await axiosInstance.patch("/auth/update-user", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    revalidatePath("/profile");
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};