"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { Event } from "@/types/event";
import { FC } from "react";
import Link from "next/link";

interface EventCardProps {
  event: Event;
}
const EventCard: FC<EventCardProps> = ({ event }) => {
  return (
    <Link href={`/events/${event.slug}`}>
      <Card>
        <CardHeader>
          <div className="relative w-full h-[200px] rounded-lg overflow-hidden ">
            <Image
              src={event.imageUrl}
              alt="event"
              fill
              className="object-cover"
              priority
            />
          </div>
        </CardHeader>
        <CardContent>
          <h2 className="font-bold text-lg">{event.title}</h2>
          <p className="line-clamp-3">{event.description}</p>
          <p className="line-clamp-3">{event.location}</p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default EventCard;
