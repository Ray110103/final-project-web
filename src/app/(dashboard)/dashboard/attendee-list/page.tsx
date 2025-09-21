import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users, Ticket, DollarSign, Calendar, MapPin } from "lucide-react";
import Image from "next/image";

const events = [
  {
    id: "1",
    title: "Tech Conference 2023",
    description: "Annual technology conference featuring the latest innovations",
    date: "2023-11-15",
    location: "San Francisco, CA",
    image: "/events/tech-conf.jpg",
    attendees: [
      {
        id: "1",
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        ticketQuantity: 2,
        totalPrice: 120,
        avatar: "/avatars/alex.jpg",
        purchaseDate: "2023-10-15",
      },
      {
        id: "2",
        name: "Sarah Williams",
        email: "sarah.w@example.com",
        ticketQuantity: 1,
        totalPrice: 60,
        avatar: "/avatars/sarah.jpg",
        purchaseDate: "2023-10-10",
      },
      {
        id: "3",
        name: "Michael Chen",
        email: "michael.c@example.com",
        ticketQuantity: 3,
        totalPrice: 180,
        avatar: "/avatars/michael.jpg",
        purchaseDate: "2023-09-28",
      },
    ],
  },
  {
    id: "2",
    title: "Music Festival 2023",
    description: "Three days of amazing music and performances",
    date: "2023-12-05",
    location: "Austin, TX",
    image: "/events/music-fest.jpg",
    attendees: [
      {
        id: "4",
        name: "Emma Davis",
        email: "emma.d@example.com",
        ticketQuantity: 1,
        totalPrice: 85,
        avatar: "/avatars/emma.jpg",
        purchaseDate: "2023-10-05",
      },
      {
        id: "5",
        name: "David Wilson",
        email: "david.w@example.com",
        ticketQuantity: 4,
        totalPrice: 340,
        avatar: "/avatars/david.jpg",
        purchaseDate: "2023-09-15",
      },
    ],
  },
];

export default function EventAttendees() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Event Attendees</h1>
        <p className="text-muted-foreground">
          View and manage attendees for each of your events
        </p>
      </div>

      <Separator />

      <div className="space-y-8">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="relative h-48 w-full md:w-64 rounded-lg overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {event.description}
                  </CardDescription>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {event.date}
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      {event.attendees.length} attendees
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="mb-6" />
              
              <h3 className="text-lg font-semibold mb-4">Attendee List</h3>
              
              <div className="space-y-4">
                {event.attendees.map((attendee) => (
                  <div key={attendee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={attendee.avatar}
                          alt={attendee.name}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{attendee.name}</p>
                        <p className="text-sm text-muted-foreground">{attendee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Tickets</p>
                        <p className="font-medium flex items-center">
                          <Ticket className="h-4 w-4 mr-1" />
                          {attendee.ticketQuantity}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-medium flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {attendee.totalPrice}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Purchased</p>
                        <p className="text-sm">{attendee.purchaseDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}