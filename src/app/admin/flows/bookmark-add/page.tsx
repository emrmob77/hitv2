import { renderDataHtml } from "@/lib/html";

export default function BookmarkAddFlowPage() {
  return renderDataHtml("bookmarks-add-flow.html", { stripHeader: false, stripFooter: false });
}
