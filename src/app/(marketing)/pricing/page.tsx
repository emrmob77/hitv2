import { renderDataHtml } from "@/lib/html";

export default function PricingPage() {
  return renderDataHtml("pricing.html", { stripHeader: true, stripFooter: false });
}
