import type { Metadata } from "next";
import AdminApp from "@/src/components/admin/AdminApp";

export const metadata: Metadata = {
  title: "Admin | Siam Khan",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminApp />;
}
