"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

const heroSlides = [
  {
    id: 1,
    title: "Temukan Penginapan Terbaik di Indonesia",
    subtitle: "Nikmati pengalaman menginap yang tak terlupakan dengan harga terjangkau",
    image: "/beautiful-indonesian-resort-with-pool-and-palm-tre.png",
    cta: "Jelajahi Sekarang",
  },
  {
    id: 2,
    title: "Liburan Impian Menanti Anda",
    subtitle: "Dari villa mewah hingga homestay nyaman, temukan tempat yang sempurna",
    image: "/cozy-indonesian-villa-with-garden-view.png",
    cta: "Mulai Pencarian",
  },
  {
    id: 3,
    title: "Booking Mudah, Liburan Menyenangkan",
    subtitle: "Sistem booking yang aman dan terpercaya untuk perjalanan Anda",
    image: "/modern-indonesian-hotel-lobby-with-comfortable-sea.png",
    cta: "Book Sekarang",
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      {/* Carousel Container */}
      <div className="relative w-full h-full">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="text-center text-white px-4 max-w-4xl">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">{slide.title}</h1>
                <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">{slide.subtitle}</p>
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  {slide.cta}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  )
}

export default HeroSection