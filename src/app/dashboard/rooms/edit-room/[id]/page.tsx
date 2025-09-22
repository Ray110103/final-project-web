import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UpdateRoom from "../components/UpdateRoom";

interface EditRoomPageProps {
  params: Promise<{
    id: string;
  }>;
}

const EditRoomPage = async ({ params }: EditRoomPageProps) => {
  const session = await auth();

  if (!session?.user) {
    return redirect("/login");
  }

  // Await the params since it's now a Promise in Next.js 15
  const { id } = await params;

  return <UpdateRoom roomId={id} />;
};

export default EditRoomPage;