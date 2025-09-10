import Footer from "@/app/(home)/components/Footer";
import Navbar from "@/app/(home)/components/Navbar";
import PropertyDetails from "../components/PropertyDetails";

const PropertyDetail = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const slug = (await params).slug;

  return (
    <main>
      <Navbar />
      <PropertyDetails slug={slug} />
      <Footer />
    </main>
  );
};

export default PropertyDetail;
