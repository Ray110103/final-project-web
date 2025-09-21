"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

interface Banner {
  src: string;
  alt: string;
  date?: string;
  location?: string;
}

const banners: Banner[] = [
  {
    src: "/pacu.webp",
    alt: "Lajur Pacu",
  },
  {
    src: "/marathon.webp",
    alt: "Marathon Running",

  },
  {
    src: "/badminton.webp",
    alt: "Badminton",
  },
  {
    src: "/minsoc.webp",
    alt: "Mini Soccer",
  },
];

const HeroCarousel = () => {
  return (
    <Carousel className="w-full p-8">
      <CarouselContent>
        {banners.map((banner, index) => (
          <CarouselItem key={index}>
            <div className="relative w-full h-[300px] md:h-[450px] lg:h-[550px] overflow-hidden rounded-lg">
              <Image
                src={banner.src}
                alt={banner.alt}
                fill
                className="object-cover"
                priority={index === 0}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-6 text-white">
                <h2 className="text-2xl md:text-4xl font-bold">{banner.alt}</h2>
                {banner.date && (
                  <p className="text-sm md:text-base">{banner.date}</p>
                )}
                {banner.location && (
                  <p className="text-sm md:text-base">{banner.location}</p>
                )}
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-10" />
      <CarouselNext className="right-10" />
    </Carousel>
  );
};

export default HeroCarousel;
