"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/#leadership", label: "Leadership" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Escape closes the mobile menu and returns focus to its toggle.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/70 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-display text-lg font-semibold tracking-tight">
          <Image
            src="/images/dulini.jpeg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-accent"
          />
          Dulini Mendis
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-muted transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
          <Link
            href="/#contact"
            className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-ink transition-colors hover:bg-blue-light"
          >
            Let&apos;s talk
          </Link>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </Container>

      {open ? (
        <nav id="mobile-menu" aria-label="Mobile" className="border-t border-border bg-background md:hidden">
          <Container className="flex flex-col py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-lg font-medium"
              >
                {l.label}
              </Link>
            ))}
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
