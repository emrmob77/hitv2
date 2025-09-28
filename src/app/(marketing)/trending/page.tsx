import { renderDataHtml } from "@/lib/html";

export default function TrendingPage() {
  return renderDataHtml("trending.html", { stripHeader: true, stripFooter: false });
}
