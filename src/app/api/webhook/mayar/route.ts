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
		console.log("=== WEBHOOK DEBUG START ===");
		console.log("Headers:", Object.fromEntries(req.headers.entries()));

		// Ambil signature dari header request
		const signature = req.headers.get("x-callback-token");
		console.log("Signature from header:", signature);

		// Ambil body request dalam bentuk text mentah
		const body = await req.text();
		console.log("Raw Body:", body);
		console.log("Body length:", body.length);

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
		console.log("Parsed Payload:", JSON.stringify(payload, null, 2));

		// Destructuring untuk mengambil event dan data dari payload
		const { event, data } = payload;
		console.log("Event Type:", event);
		console.log("Event Data:", JSON.stringify(data, null, 2));

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

		console.log("Found user:", user.id);

		// Handle berbagai jenis event dari webhook
		switch (event) {
			case "payment.success":
			case "payment.received": {
				// Jika pembayaran berhasil, tambahkan token sesuai paket
				console.log("Processing payment event");
				// Ambil package type dari membershipTierName
				const packageType = data.membershipTierName
					?.toLowerCase()
					.includes("silver")
					? "silver"
					: "gold";
				console.log("Package Type:", packageType);
				await addTokensByPackage(user.id, packageType);
				console.log("Tokens added successfully");
				break;
			}

			case "subscription.activated": {
				// Jika subscription diaktifkan, update status subscription
				console.log("Processing subscription.activated");
				await updateSubscription(
					user.id,
					data.licenseCode,
					new Date(data.expiredAt),
				);
				console.log("Subscription updated successfully");
				break;
			}

			default:
				console.log("Unhandled event type:", event);
		}

		console.log("=== WEBHOOK DEBUG END ===");

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
