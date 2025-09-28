import { renderDataHtml } from "@/lib/html";

export default function AdminSeoSettingsPage() {
  return renderDataHtml("admin-seo-settings.html", { stripHeader: false, stripFooter: false });
}
