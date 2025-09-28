import { renderDataHtml } from "@/lib/html";

export default function CollectionPage() {
  return renderDataHtml("collection.html", { stripHeader: true, stripFooter: false });
}
