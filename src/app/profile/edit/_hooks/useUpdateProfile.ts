"use client"

import axiosInstance from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Payload {
  name: string;
  pictureProfile: File | null;
}
export const useUpdateProfile = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useSession();

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const form = new FormData();
      if (payload.pictureProfile) {
        form.append("pictureProfile", payload.pictureProfile);
      }

      if (payload.name) {
        form.append("name", payload.name);
      }

      await axiosInstance.patch("/profile/edit", form, {
        headers: { Authorization: `Bearer ${session.data?.user.accessToken}` },
      });
    },

    onSuccess: async () => {
      alert("Profile updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/profile");
    },

    onError: (error: AxiosError<{ message: string; code: number }>) => {
      alert(error.response?.data.message ?? "Something went wrong!");
    },
  });
};
