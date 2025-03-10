import { prisma } from "@/lib/prisma";
import { addTokensByPackage, updateSubscription } from "@/lib/subscription";
import { NextResponse } from "next/server";

function verifyWebhookSignature(signature: string): boolean {
	const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET;

	// cek apakah webhook secret tersedia
	if (!webhookSecret) {
		return false;
	}

	// bandingkan signature dr request dengan webhook secret
	return signature === webhookSecret;
}

export async function POST(req: Request) {
	try {
		// ambil signature dari header request
		const signature = req.headers.get("x-callback-token");

		// ambil body request dalam bentuk text
		const body = await req.text();

		// verifikasi keberadaan signature
		if (!signature) {
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}

		// verifikasi kebenaran signature
		if (!verifyWebhookSignature(signature)) {
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}

		// ubah body text menjadi object Js
		const payload = JSON.parse(body);

		// ekstrak event dan data dari payload
		const { event, data } = payload;

		// misalnya ada event testing khusus
		if (event === "testing") {
			return NextResponse.json({ success: true });
		}

		// Mengambil email pengguna dari data webhook
		const userEmail = data.customerEmail || data.customer?.email;

		// pastikan email pengguna tersedia
		if (!userEmail) {
			return NextResponse.json(
				{ error: "No customer email provided" },
				{ status: 400 },
			);
		}

		// cari user di database berdasarkan email
		const user = await prisma.user.findUnique({
			where: { email: userEmail },
		});

		// jika user tidak ditemukan
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// handle berbagai jenis event webhook
		switch (event) {
			case "payment.success":
			case "payment.received": {
				// tentukan jenis paket berdasarkan nama tier nya
				const packageType = data.membershipTierName
					?.toLowerCase()
					.includes("silver")
					? "silver"
					: "gold";
				// tambah token sesuai paket
				await addTokensByPackage(user.id, packageType);
				break;
			}

			case "subscription.activated": {
				// event aktivasi subscription, update data subscription user
				await updateSubscription(
					user.id,
					data.licenseCode,
					new Date(data.expiredAt),
				);
				break;
			}

			default:
		}
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
