import type { ReactNode } from "react";

import { MarketingHeader } from "@/components/layout/marketing-header";

export default async function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="marketing-html">
      <MarketingHeader />
      <div className="data-html">{children}</div>
    </div>
  );
}
