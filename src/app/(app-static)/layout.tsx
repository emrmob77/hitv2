import type { ReactNode } from "react";

export default function AppStaticLayout({ children }: { children: ReactNode }) {
  return <div className="data-html app-html">{children}</div>;
}
