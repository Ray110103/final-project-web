import { auth } from "@/auth";
import { notFound } from "next/navigation";
import ManageTicketsPage from "./components/manage-tickets";

const ManageTickets = async () => {
  const session = await auth();

  if (!session?.user || session?.user.role !== "ORGANIZER") return notFound();

  return <ManageTicketsPage />;
};

export default ManageTickets;
