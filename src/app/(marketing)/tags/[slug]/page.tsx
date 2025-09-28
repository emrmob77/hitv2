import { renderDataHtml } from "@/lib/html";

export default function TagDetailsPage() {
  return renderDataHtml("tag-details.html", { stripHeader: true, stripFooter: false });
}
