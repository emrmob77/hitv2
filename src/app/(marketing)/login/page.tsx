import { renderDataHtml } from "@/lib/html";

export default function LoginPage() {
  return renderDataHtml("login-register.html", { stripChrome: false });
}
