"use client";

import EventCard from "@/app/events/_components/EventCard";
import EventCardSkeleton from "@/app/events/_components/EventCardSkeleton";
import useGetEvents from "@/app/events/_hooks/useGetEvents";
import Link from "next/link";
import { useState } from "react";
import { useDebounceValue } from "usehooks-ts";

const EventHome = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [debounceSearch] = useDebounceValue(search, 500);

  const { data: events, isPending } = useGetEvents({
    page,
    search: debounceSearch,
  });

  return (
    
     <div className="container mx-auto mt-4 md:mt-15 p-4 py-4 md:px-8 lg:px-0">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-left text-3xl font-semibold text-white">Newest Event</h3>
        <Link
          href="/events"
          className="text-sm text-orange-400 hover:underline"
        >
          See all
        </Link>
      </div>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {isPending && <EventCardSkeleton count={3} />}

        {events?.data?.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </div>
  );
};

export default EventHome;
