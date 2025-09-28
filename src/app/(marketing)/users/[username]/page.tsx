import { renderDataHtml } from "@/lib/html";

export default function UserProfilePage() {
  return renderDataHtml("profile.html", { stripChrome: false });
}
