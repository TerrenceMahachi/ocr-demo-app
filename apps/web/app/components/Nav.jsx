"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Capture Record" },
  { href: "/records", label: "List Records" },
];

export default function Nav() {
  const pathname = usePathname();

  function isActive(href) {
    return href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);
  }

  return (
    <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
    
      <Link href="/" className="group inline-flex items-center gap-2 font-semibold">
        <span className="text-lg tracking-tight">OCR Demo APP</span>
        <span className="h-5 w-px bg-gray-300"></span>
        <span className="text-xs text-gray-500 group-hover:text-gray-700 transition">
          capture • extract • review
        </span>
      </Link>

     
      <ul className="flex items-center gap-1">
        {links.map((l) => {
          const active = isActive(l.href);
          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "inline-flex items-center rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "font-medium text-blue-700 bg-blue-50 border border-blue-200"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
                ].join(" ")}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}