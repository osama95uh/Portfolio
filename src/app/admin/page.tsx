import type { Metadata } from "next";
import AdminApp from "@/src/components/admin/AdminApp";

export const metadata: Metadata = {
  title: { absolute: "Siam Khan [NOC]" },
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
