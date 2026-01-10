"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import Drawer from "@/app/components/Drawer";

export default function DrawerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  const isOpen = Boolean(segment); // open only when [questionId] is active

  return <Drawer isOpen={isOpen}>{children}</Drawer>;
}
