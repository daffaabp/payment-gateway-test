import { type SessionData, sessionOptions } from "@/lib/sessions";
import { getIronSession } from "iron-session";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/chat"];

export async function middleware(request: NextRequest) {
	const response = NextResponse.next();

	// Get the current path
	const path = request.nextUrl.pathname;
	const isProtectedRoute = protectedRoutes.some((route) =>
		path.startsWith(route),
	);

	// Get session from cookie
	const session = await getIronSession<SessionData>(
		request,
		response,
		sessionOptions,
	);

	// Redirect to login if accessing protected route without auth
	if (isProtectedRoute && !session.userId) {
		const loginUrl = new URL("/auth/login", request.url);
		return NextResponse.redirect(loginUrl);
	}

	return response;
}

// Configure the middleware to run only on protected paths
export const config = {
	matcher: ["/dashboard/:path*", "/chat/:path*"],
};
