import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const session = await getSession();

		if (!session?.userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Ambil data user dengan profile
		const user = await prisma.user.findUnique({
			where: { id: session.userId },
			include: {
				UserProfile: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Format data untuk response
		const profile = user.UserProfile[0]; // Ambil profile pertama
		const userData = {
			name: profile ? `${profile.firstName} ${profile.lastName}`.trim() : "",
			email: user.email,
			phone: profile?.phone || "",
		};

		return NextResponse.json(userData);
	} catch (error) {
		console.error("Error fetching user profile:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
