import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Payload {
  name: string;
  pictureProfile: File | null;
}

interface ErrorResponse {
  message: string;
  code?: number;
  errors?: Record<string, string[]>;
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

      const { data } = await axiosInstance.patch("/profile/edit", form, {
        headers: { 
          Authorization: `Bearer ${session.data?.user.accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return data;
    },

    onSuccess: async (data) => {
      toast.success(data?.message || "Profil berhasil diperbarui!");
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      router.push("/profile");
    },

    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Update profile error:", error);
      
      if (!error.response) {
        toast.error("Koneksi bermasalah. Silakan coba lagi.");
        return;
      }

      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          if (data?.errors) {
            const firstError = Object.values(data.errors)[0]?.[0];
            toast.error(firstError || "Data yang dimasukkan tidak valid");
          } else {
            toast.error(data?.message || "Data profil tidak valid");
          }
          break;
        case 401:
          toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
          break;
        case 413:
          toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
          break;
        case 415:
          toast.error("Format file tidak didukung. Gunakan JPG, PNG, atau GIF.");
          break;
        case 422:
          toast.error("Format data tidak valid. Periksa kembali informasi Anda.");
          break;
        case 429:
          toast.error("Terlalu banyak permintaan. Tunggu beberapa menit.");
          break;
        case 500:
          toast.error("Server bermasalah. Silakan coba lagi nanti.");
          break;
        default:
          toast.error(data?.message || "Gagal memperbarui profil. Silakan coba lagi.");
      }
    },
  });
};