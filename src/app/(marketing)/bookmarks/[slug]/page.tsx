import { renderDataHtml } from "@/lib/html";

export default function BookmarkDetailPage() {
  return renderDataHtml("bookmarks-detail.html", { stripHeader: true, stripFooter: false });
}
