import { axiosInstance } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Payload {
  title: string;
  category: string;
  description: string;
  city: string;
  address: string;
  location: string;
  latitude: string;
  longtitude: string; // ✅ keep as-is (backend expects this)
  thumbnail?: File;   // ✅ safer than File | null
}

const useCreateProperty = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (payload: Payload) => {
      const form = new FormData();
      form.append("title", payload.title);
      form.append("category", payload.category);
      form.append("location", payload.location);
      form.append("description", payload.description);
      form.append("city", payload.city);
      form.append("address", payload.address);
      form.append("latitude", payload.latitude);
      form.append("longtitude", payload.longtitude); // ✅ stays the same

      if (payload.thumbnail) {
        form.append("thumbnail", payload.thumbnail);
      }

      await axiosInstance.post("/property", form, {
        headers: {
          Authorization: `Bearer ${session?.user.accessToken}`,
        },
      });
    },
    onSuccess: async () => {
      alert("Property created successfully!");
      await queryClient.invalidateQueries({ queryKey: ["property"] });
      router.push("/"); // ⬅️ adjust if you want to go to /properties or detail page
    },
    onError: (error: AxiosError<{ message: string; code: number }>) => {
      alert(error.response?.data.message ?? "Something went wrong!");
    },
  });
};

export default useCreateProperty;
