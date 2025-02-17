import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Navigation from "@/components/Navigation";
import "@/styles/layout.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="dashboard-layout">
      <div className="dashboard-sidebar">
        <Navigation />
      </div>
      <div className="dashboard-content">
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
}
