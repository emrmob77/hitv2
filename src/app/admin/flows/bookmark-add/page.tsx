import { renderDataHtml } from "@/lib/html";

export default function BookmarkAddFlowPage() {
  return renderDataHtml("bookmarks-add-flow.html", { stripChrome: false });
}
