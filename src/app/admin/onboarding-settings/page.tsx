import { renderDataHtml } from "@/lib/html";

export default function OnboardingSettingsPage() {
  return renderDataHtml("new-user-onboarding-settings.html", { stripHeader: false, stripFooter: false });
}
