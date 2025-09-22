import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateRoom from "./components/CreateRoom";

const DashboardCreateRoom = async () => {
  const session = await auth();

  if (!session?.user) return redirect(`/login`);

  return (
    <div>
      <CreateRoom />
    </div>
  );
};

export default DashboardCreateRoom;
