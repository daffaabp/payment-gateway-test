import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions"; 
import { NextResponse } from "next/server";

// Mendefinisikan endpoint GET untuk mengambil sisa token
export async function GET() {
	try {
		// Mengambil data sesi user yang sedang login
		const session = await getSession();

		// Cek apakah user sudah login dengan memeriksa userId
		if (!session.userId) {
			// Jika belum login, kirim response error 401 Unauthorized
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Mencari data token user di database berdasarkan userId
		const token = await prisma.chatToken.findUnique({
			where: { userId: session.userId },
		});

		// Mengirim response berisi sisa token
		// Jika token tidak ditemukan, kirim nilai 0
		return NextResponse.json({
			remaining: token?.remaining ?? 0,
		});
	} catch (error) {
		// Jika terjadi error, log error ke console
		console.error("Error fetching token:", error);
		// Kirim response error 500 Internal Server Error
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
