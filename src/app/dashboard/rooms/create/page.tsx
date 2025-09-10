import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import CreateRoom from "./components/CreateRoom";

const DashboardCreateRoom = async () => {
  const session = await auth();

  if (!session?.user) return redirect(`/login`);

  return <CreateRoom />;
};

export default DashboardCreateRoom;
