import { renderDataHtml } from "@/lib/html";

export default function ExplorePage() {
  return renderDataHtml("explorer.html", { stripChrome: false });
}
