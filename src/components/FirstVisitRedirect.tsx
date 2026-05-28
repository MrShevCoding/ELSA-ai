"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FirstVisitRedirect({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const visited = localStorage.getItem("hasSeenWelcome");
    if (!visited) {
      router.replace("/welcome");
    }
  }, [router]);

  return <>{children}</>;
}
