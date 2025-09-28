import { renderDataHtml } from "@/lib/html";

export default function AdminDashboardPage() {
  return renderDataHtml("admin-dashboard.html", { stripChrome: false });
}
