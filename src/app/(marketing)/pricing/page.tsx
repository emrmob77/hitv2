import { renderDataHtml } from "@/lib/html";

export default function PricingPage() {
  return renderDataHtml("pricing.html", { stripChrome: false });
}
