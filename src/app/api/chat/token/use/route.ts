import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { NextResponse } from "next/server";

// Mendefinisikan endpoint POST untuk menggunakan satu token chat
export async function POST() {
	try {
		// Mendapatkan data sesi pengguna yang sedang aktif
		const session = await getSession();

		// Memeriksa apakah ada userId dalam sesi
		// Jika tidak ada, berarti pengguna belum login
		if (!session.userId) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Mencari data token chat pengguna di database
		const token = await prisma.chatToken.findUnique({
			where: { userId: session.userId },
		});

		// Memeriksa apakah token tersedia dan masih cukup
		// Jika token habis atau tidak ada, kembalikan error
		if (!token || token.remaining <= 0) {
			return NextResponse.json(
				{ error: "Insufficient tokens" },
				{ status: 403 },
			);
		}

		// Memperbarui jumlah token yang tersisa di database
		// Mengurangi 1 token dari total yang ada
		const updatedToken = await prisma.chatToken.update({
			where: { userId: session.userId },
			data: { remaining: token.remaining - 1 },
		});

		// Mengembalikan response sukses dengan jumlah token yang tersisa
		return NextResponse.json({
			remaining: updatedToken.remaining,
		});
	} catch (error) {
		// Menangani error yang mungkin terjadi
		// Mencatat error ke console untuk debugging
		console.error("Error using token:", error);
		// Mengembalikan pesan error umum ke client
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
