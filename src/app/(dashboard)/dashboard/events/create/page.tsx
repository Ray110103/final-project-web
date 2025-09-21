import { auth } from "@/auth"
import { notFound, redirect } from "next/navigation";
import WritePage from "../components/createEvent";


const Write = async () => {
  const session = await auth();

  if (!session?.user) return redirect("/login");


  return <WritePage />;
};

export default Write;
