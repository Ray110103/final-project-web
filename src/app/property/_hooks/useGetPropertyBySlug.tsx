import { Property } from "@/app/types/property";
import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

const useGetPropertyBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["property", slug],
    queryFn: async () => {
      const { data } = await axiosInstance.get<Property>(`/property/${slug}`);
      return data;
    },
  });
};

export default useGetPropertyBySlug;
