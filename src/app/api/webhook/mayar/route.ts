import { prisma } from "@/lib/prisma";
import { addTokensByPackage, updateSubscription } from "@/lib/subscription";
import { NextResponse } from "next/server";

// Fungsi untuk memverifikasi signature webhook dari Mayar
// Mayar mengirim webhook secret langsung sebagai x-callback-token
function verifyWebhookSignature(signature: string): boolean {
	// Ambil webhook secret dari environment variable
	const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET;

	// Log webhook secret (hanya panjangnya untuk keamanan)
	console.log("Webhook Secret exists:", !!webhookSecret);
	console.log("Webhook Secret length:", webhookSecret?.length || 0);

	// Cek apakah webhook secret tersedia
	if (!webhookSecret) {
		console.error("MAYAR_WEBHOOK_SECRET is not defined");
		return false;
	}

	// Log signature untuk debugging
	console.log("Received signature:", signature);
	console.log("Expected webhook secret:", webhookSecret);
	console.log("Signature match:", signature === webhookSecret);

	// Bandingkan signature yang diterima dengan webhook secret
	return signature === webhookSecret;
}

// Handler untuk request POST ke endpoint webhook
export async function POST(req: Request) {
	try {
		// Log semua headers untuk debugging
		console.log("Headers:", Object.fromEntries(req.headers.entries()));

		// Ambil signature dari header request
		const signature = req.headers.get("x-callback-token");
		console.log("Signature from header:", signature);

		// Ambil body request dalam bentuk text mentah
		const body = await req.text();
		console.log("Body length:", body.length);
		console.log(
			"Body preview:",
			body.substring(0, 100) + (body.length > 100 ? "..." : ""),
		);

		// Verifikasi signature webhook
		if (!signature) {
			console.error("No signature provided in headers");
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}

		if (!verifyWebhookSignature(signature)) {
			console.error("Signature verification failed");
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}

		// Parse body JSON menjadi object JavaScript
		const payload = JSON.parse(body);
		// Destructuring untuk mengambil event dan data dari payload
		const { event, data } = payload;
		console.log("Event:", event);
		console.log("Data:", data);

		// Jika event testing, kirim response sukses
		if (event === "testing") {
			console.log("Received testing event, sending success response");
			return NextResponse.json({ success: true });
		}

		// Cari user berdasarkan email yang diterima
		const userEmail = data.customerEmail || data.customer?.email;
		console.log("Looking for user with email:", userEmail);

		if (!userEmail) {
			console.error("No customer email found in payload");
			return NextResponse.json(
				{ error: "No customer email provided" },
				{ status: 400 },
			);
		}

		const user = await prisma.user.findUnique({
			where: { email: userEmail },
		});

		// Jika user tidak ditemukan, kirim response error
		if (!user) {
			console.error("User not found:", userEmail);
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Handle berbagai jenis event dari webhook
		switch (event) {
			case "payment.success":
				// Jika pembayaran berhasil, tambahkan token sesuai paket
				console.log("Processing payment.success for user:", user.id);
				await addTokensByPackage(user.id, data.package);
				break;

			case "subscription.activated":
				// Jika subscription diaktifkan, update status subscription
				console.log("Processing subscription.activated for user:", user.id);
				await updateSubscription(
					user.id,
					data.licenseCode,
					new Date(data.expiredAt),
				);
				break;

			default:
				console.log("Unhandled event type:", event);
		}

		// Kirim response sukses
		return NextResponse.json({ success: true });
	} catch (error) {
		// Jika terjadi error, log error dan kirim response error
		console.error("Webhook error:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
