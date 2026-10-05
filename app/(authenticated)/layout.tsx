import { type ReactNode } from "react";

import { AuthenticatedArea } from "@/components/auth/authenticated-area";

export default function AuthenticatedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <AuthenticatedArea>{children}</AuthenticatedArea>;
}
