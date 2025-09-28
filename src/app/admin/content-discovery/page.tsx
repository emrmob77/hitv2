import { renderDataHtml } from "@/lib/html";

export default function ContentDiscoveryFlowPage() {
  return renderDataHtml("content-discovery-flow-admin.html", { stripHeader: false, stripFooter: false });
}
