import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UpdateProperty from "../components/UpdateProperty";

interface EditPropertyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const EditPropertyPage = async ({ params }: EditPropertyPageProps) => {
  const session = await auth();

  if (!session?.user) {
    return redirect("/login");
  }

  // Await the params since it's now a Promise in Next.js 15
  const { slug } = await params;

  return <UpdateProperty slug={slug} />;
};

export default EditPropertyPage;