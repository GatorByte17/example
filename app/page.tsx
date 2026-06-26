import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Dashboard from "@/components/layout/Dashboard";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <Dashboard />;
}
