"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? "nav-link active" : "nav-link";
  };

  return (
    <nav className="navbar">
      <Link href="/" className="nav-logo">
        <div className="logo-icon"></div>
        <span>ELSA <span style={{ color: "var(--accent-cyan)" }}>AI</span></span>
      </Link>
      <ul className="nav-links">
        <li>
          <Link href="/" className={isActive("/")}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/score" className={isActive("/score")}>
            Scoring Tool
          </Link>
        </li>
        <li>
          <Link href="/docs" className={isActive("/docs")}>
            Methodology
          </Link>
        </li>
        <li>
          <Link href="/about" className={isActive("/about")}>
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
}
