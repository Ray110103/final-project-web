import axiosInstance from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { Event } from "@/types/event";
import { PageableResponse, PaginationQueries } from "@/types/pagination";

interface GetEventsQuery extends PaginationQueries {
  search?: string;
  category?: string;
}
const useGetEvents = (queries?: GetEventsQuery) => {
  console.log(queries);
  
  return useQuery({
    queryKey: ["events", queries],
    queryFn: async () => {
      const { data } = await axiosInstance.get<PageableResponse<Event>>(
        "/events",
        { params: queries }
      );
      return data;
    },
  });
};

export default useGetEvents;
