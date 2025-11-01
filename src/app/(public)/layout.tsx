import type { ReactNode } from "react";
import { MarketingHeader } from "@/components/layout/marketing-header";
import { MarketingFooter } from "@/components/layout/marketing-footer";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="marketing-html">
      <div className="data-html flex min-h-screen flex-col">
        <MarketingHeader />
        <main className="flex-1">{children}</main>
        <MarketingFooter />
      </div>
    </div>
  );
}
