import { renderDataHtml } from "@/lib/html";

export default function BookmarkAddPage() {
  return renderDataHtml("add-bookmarks.html", { stripChrome: false });
}
