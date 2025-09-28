import { renderDataHtml } from "@/lib/html";

export default function TagDetailsPage() {
  return renderDataHtml("tag-details.html", { stripChrome: false });
}
