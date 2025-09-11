import React from "react";
import NavigationBar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import Footer from "./components/Footer";
import SearchForm from "./components/SearchForm";
import PropertyList from "./components/PropertiesPreview";

const page = () => {
  return (
    <div>
      <NavigationBar />
      <HeroSection />
      <SearchForm />
      <PropertyList />
      <Footer />
    </div>
  );
};

export default page;
