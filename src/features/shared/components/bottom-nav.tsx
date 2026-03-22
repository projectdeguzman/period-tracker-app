"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Today", href: "/" },
  { label: "Calendar", href: "/calendar" },
  { label: "Logs", unavailable: true },
  { label: "Insights", unavailable: true },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-4 mx-auto w-[calc(100%-2rem)] max-w-md rounded-full border border-white/60 bg-white/92 p-2 shadow-[0_18px_50px_rgba(34,27,40,0.12)] backdrop-blur"
    >
      <ul className="grid grid-cols-4 gap-2">
        {navItems.map((item) => {
          const isUnavailable = "unavailable" in item;
          const isActive = !isUnavailable && isActivePath(pathname, item.href);
          const baseClassName = [
            "flex w-full items-center justify-center rounded-full px-3 py-3 text-sm font-medium transition",
            isActive
              ? "bg-accent text-white shadow-[0_10px_24px_rgba(169,52,86,0.24)]"
              : isUnavailable
                ? "cursor-not-allowed text-foreground/40 line-through decoration-1"
                : "text-foreground/62 hover:bg-surface-muted",
          ].join(" ");

          return (
            <li key={item.label}>
              {isUnavailable ? (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className={baseClassName}
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={baseClassName}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
