import axiosInstance from "@/lib/axios";
import { Event } from "@/types/event";
import { cache } from "react";

export const getEvent =  cache(async (slug: string) => {
  const { data } = await axiosInstance.get<Event>(`/events/${slug}`);
  return data;
});
