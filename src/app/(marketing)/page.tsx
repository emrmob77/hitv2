import { renderDataHtml } from "@/lib/html";

export default function HomePage() {
  return renderDataHtml("home.html", { stripHeader: true, stripFooter: false });
}
