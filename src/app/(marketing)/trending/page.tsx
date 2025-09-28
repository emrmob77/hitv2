import { renderDataHtml } from "@/lib/html";

export default function TrendingPage() {
  return renderDataHtml("trending.html", { stripChrome: false });
}
