import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-ink"
    >
      <ArrowLeft size={16} />
      {children}
    </Link>
  );
}
