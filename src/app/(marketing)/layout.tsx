import type { ReactNode } from "react";

import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default async function MarketingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="marketing-html">
      <div className="data-html">
        <MarketingHeader />
        {children}
        <MarketingFooter />
      </div>
    </div>
  );
}
