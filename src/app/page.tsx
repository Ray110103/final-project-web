import CategoryEvent from "@/components/Categoryevent";
import EventHome from "@/components/eventhome";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";


export default function Home() {
  return (
    <main>
      <HeroSection />
      <CategoryEvent />
      <EventHome />
      <Footer />
    </main>
  );
}
