"use client";

import PaginationSection from "@/components/PaginationSection";
import useGetEvents from "../_hooks/useGetEvents";
import EventCard from "./EventCard";
import EventCardSkeleton from "./EventCardSkeleton";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useDebounceValue } from "usehooks-ts";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";

const EventList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("All");


  console.log(category);
  

  const [debounceSearch] = useDebounceValue(search, 500);

   useEffect(() => {
    const urlCategory = searchParams.get("category");

    if (urlCategory) setCategory(urlCategory);
  }, [searchParams]);


  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    category !== "All"
      ? params.set("category", category)
      : params.delete("category");
    router.replace(`/events?${params.toString()}`);
  }, [category]);

  const { data: events, isPending } = useGetEvents({
    page,
    search: debounceSearch,
    category: category === "All" ? undefined : category,
  });

  console.log(events);


  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center  gap-4 mb-8 mt-12">
        <Input
          type="text"
          placeholder="Search..."
          className="w-full sm:max-w-sm"
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={category} onValueChange={(value) => setCategory(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Single">Single</SelectItem>
              <SelectItem value="Double">Double</SelectItem>
              <SelectItem value="Team">Team</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

     
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {isPending && <EventCardSkeleton count={3} />}

        {events?.data.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>

      {/* Pagination */}
      {events && (
        <div className="mt-12">
          <PaginationSection meta={events.meta} setPage={setPage} />
        </div>
      )}
    </>
  );
};

export default EventList;
