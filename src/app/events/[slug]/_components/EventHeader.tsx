// app/events/[slug]/components/EventHeader.tsx
import Image from "next/image";
import { getEvent } from "../_api/get-event";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Calendar, Clock, Sparkles } from "lucide-react";

interface EventHeaderProps {
  slug: string;
}

const EventHeader = async ({ slug }: EventHeaderProps) => {
  const event = await getEvent(slug);
  const totalPrice = 0; 

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const formattedDate =
    startDate.toDateString() === endDate.toDateString()
      ? startDate.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : `${startDate.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })} - ${endDate.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })}`;

  return (
    <section>
      <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]">
          {/* LEFT */}
          <div className="space-y-6">
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-md">
              <Image
                src={event.thumbnail || "/pacu.webp"}
                alt="Event Poster"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
              />
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-full p-1 text-sm">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="tickets">Tickets</TabsTrigger>
              </TabsList>

              <TabsContent
                value="description"
                className="space-y-4 pt-6 text-sm leading-relaxed "
              >
                <p>{event.description}</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Tiket secara resmi hanya dijual melalui Loket.com.</li>
                  <li>
                    <span className="italic">Barcode</span> pada tiket ini digunakan
                    sebagai akses masuk untuk ditukarkan{" "}
                    <span className="italic">wristband</span>.
                  </li>
                  <li>
                    1 <span className="italic">e-ticket/e-voucher</span> berlaku untuk 1 orang.
                  </li>
                </ul>
              </TabsContent>

              <TabsContent value="tickets" className="pt-6">
                <Card className="border-orange-200">
                  <CardContent className="flex items-start gap-3 p-6 text-sm ">
                    <Sparkles className="mt-1 h-5 w-5 text-orange-500" />
                    <span>
                      You haven't selected any tickets. Please choose one first in the{" "}
                      <span className="font-medium text-orange-500">Tickets</span> tab.
                    </span>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4 p-6 ">
                <h1 className="text-2xl font-bold ">{event.title}</h1>

                <div className="space-y-2 text-sm ">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-orange-500" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-orange-500" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-5 w-5 text-orange-500" />
                    <span>19:00 - 23:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium ">Total price</span>
                  <span className="text-xl font-bold ">
                    Rp {totalPrice.toLocaleString()}
                  </span>
                </div>
                <Button className="w-full bg-orange-500 py-3 text-sm font-medium  hover:bg-orange-600">
                  Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EventHeader;
