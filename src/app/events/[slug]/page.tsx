import { Suspense } from "react";
import Loading from "@/components/Loading";
import EventHeader from "./_components/EventHeader";

const EventDetail = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const slug = (await params).slug;
  return (
    <main className="container mx-auto px-4 pb-20">
      <Suspense fallback={<Loading />}>
        <EventHeader slug={slug} /> 
      </Suspense>
    </main>
  );
};

export default EventDetail;
