import { PageableResponse, PaginationQueries } from "@/types/pagination";
import { Property } from "@/types/property";
import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

interface GetPropertyQuery extends PaginationQueries {
  search?: string;
  category?: string;
  location?: string;
}

const useGetProperties = (queries?: GetPropertyQuery) => {
  return useQuery({
    queryKey: ["property", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageableResponse<Property>>(
        "/property",
        { params: queries },
      );
      return data;
    },
  });
};

export default useGetProperties;
