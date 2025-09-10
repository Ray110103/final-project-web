import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CreateProperty from "./components/CreateProperty";

const DashboardCreateProperty = async () => {
  const session = await auth();

  if (!session?.user) return redirect(`/login`);

  return <CreateProperty />;
};

export default DashboardCreateProperty;
