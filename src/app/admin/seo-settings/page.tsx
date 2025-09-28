import { renderDataHtml } from "@/lib/html";

export default function AdminSeoSettingsPage() {
  return renderDataHtml("admin-seo-settings.html", { stripChrome: false });
}
