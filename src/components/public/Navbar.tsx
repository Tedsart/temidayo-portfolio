"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { nav, siteConfig } from "@/lib/config";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the sheet is open. The sheet closes via each
  // link's onClick (and unmounts on navigation because open state resets).

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-line bg-paper/85 shadow-editorial backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1360px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="group flex items-baseline gap-1 font-display text-lg font-semibold tracking-tight text-ink md:text-xl"
          aria-label={`${siteConfig.name} — back to home`}
          title="Back to home"
        >
          <span className="transition-colors group-hover:text-accent">
            Temidayo Kukoyi
          </span>
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-marker transition-transform duration-300 group-hover:scale-125"
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {nav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="link-sweep group relative py-1 text-sm text-ink-2 transition-colors hover:text-ink"
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300 ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-ink/25 px-4 py-2 text-sm transition-colors hover:border-ink hover:bg-ink hover:text-paper"
          >
            Let&apos;s talk
            <span aria-hidden="true" className="text-accent transition-colors group-hover:text-paper">
              ↗
            </span>
          </Link>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center border border-line md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="relative block h-3 w-4" aria-hidden="true">
            <span
              className={`absolute left-0 h-px w-4 bg-ink transition-all duration-300 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 h-px w-4 bg-ink transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-px w-4 bg-ink transition-all duration-300 ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            className="border-t border-line bg-paper md:hidden"
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={reduced ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: reduced ? 0.01 : 0.32, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <nav aria-label="Mobile" className="px-5 py-6 sm:px-8">
              <ul className="flex flex-col divide-y divide-line border-y border-line">
                {nav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduced ? 0.01 : 0.3, delay: reduced ? 0 : 0.05 * i }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between py-4 text-2xl font-medium tracking-tight"
                    >
                      {item.label}
                      <span className="section-index">0{i + 1}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-6 flex items-center justify-center bg-ink px-6 py-4 text-sm text-paper"
              >
                Let&apos;s talk
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
