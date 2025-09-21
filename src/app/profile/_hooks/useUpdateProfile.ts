import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@/types/user";

interface UpdateProfilePayload {
  name: string;
  email: string;
  bio?: string;
  profilePicture?: File | null;
  userId: string;
  password?: string;
  confirmPassword?: string;
}

const useUpdateProfile = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session, update } = useSession();

  return useMutation({
    mutationFn: async (payload: UpdateProfilePayload) => {
      const formData = new FormData();

      // Append all fields to FormData
      formData.append("name", payload.name);
      formData.append("email", payload.email);
      formData.append("userId", payload.userId);
      
      
      if (payload.password) {
        formData.append("password", payload.password);
      
      }
      
      if (payload.profilePicture) {
        formData.append("profilePicture", payload.profilePicture);
      }

      const response = await axiosInstance.patch<User>("/auth/update-user", formData, {
        headers: { 
          Authorization: `Bearer ${session?.user.accessToken}` 
        },
      });


      return response.data;
    },
    onSuccess: async (data) => {
      // Update the session with new user data
      await signIn("credentials", { ...data, redirect: false });
      toast.success("Profile updated successfully!");
      router.refresh();
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
      console.error("Profile update error:", error);
      
      // Redirect to login if unauthorized
      if (error.response?.status === 401) {
        router.push("/signin");
      }
    },
  });
};

export default useUpdateProfile;