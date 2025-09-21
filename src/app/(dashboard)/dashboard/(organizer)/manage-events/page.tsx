import { auth } from "@/auth";
import { notFound } from "next/navigation";
import ManageEventsPage from "./components/manage-events";

const ManageEvents = async () => {
  const session = await auth();

  if (!session?.user) //return redirect("/");
  return notFound();

  return <ManageEventsPage />;
};

export default ManageEvents;
