import { renderDataHtml } from "@/lib/html";

export default function BookmarkAddPage() {
  return renderDataHtml("add-bookmarks.html", { stripHeader: false, stripFooter: false });
}
