import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // Run on everything except static assets, the widget script, and widget APIs
  // (those are public / handled with the service role).
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|widget.js|api/widget|api/events|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
