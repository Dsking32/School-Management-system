import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  return withAuth(request);
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*"],
};
