import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import NavigationBar from "./components/Navbar";
import PropertyPreview from "./components/PropertiesPreview";
import LandingSearchForm from "./components/SearchForm";

const page = () => {
  return (
    <div>
      <NavigationBar />
      <HeroSection />
      <LandingSearchForm />
      <PropertyPreview />
      <Footer />
    </div>
  );
};

export default page;
