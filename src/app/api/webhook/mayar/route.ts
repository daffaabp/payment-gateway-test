
import { prisma } from "@/lib/prisma";
import { addTokensByPackage, updateSubscription } from "@/lib/subscription";
import { NextResponse } from "next/server";

// Fungsi untuk memverifikasi signature webhook dari Mayar
// Mayar mengirim webhook secret sebagai x-callback-token di header
function verifyWebhookSignature(signature: string): boolean {
    // Mengambil webhook secret dari environment variable
    const webhookSecret = process.env.MAYAR_WEBHOOK_SECRET;

    // Mencatat keberadaan webhook secret ke log (untuk debugging)
    console.log("Webhook Secret exists:", !!webhookSecret); // Mengecek apakah webhook secret ada
    console.log("Webhook Secret length:", webhookSecret?.length || 0); // Mencatat panjang webhook secret

    // Memeriksa apakah webhook secret tersedia di environment variables
    if (!webhookSecret) {
        console.error("MAYAR_WEBHOOK_SECRET is not defined"); // Mencatat error jika secret tidak ditemukan
        return false; // Mengembalikan false jika secret tidak ada
    }

    // Mencatat informasi signature untuk keperluan debugging
    console.log("Received signature:", signature); // Signature yang diterima dari request
    console.log("Expected webhook secret:", webhookSecret); // Secret yang diharapkan
    console.log("Signature match:", signature === webhookSecret); // Hasil pencocokan

    // Membandingkan signature dari request dengan webhook secret
    return signature === webhookSecret; // Mengembalikan true jika cocok, false jika tidak
}

// Handler utama untuk menerima webhook POST request dari Mayar
export async function POST(req: Request) {
    try {
        // Mencatat semua headers request untuk debugging
        console.log("=== WEBHOOK DEBUG START ===");
        console.log("Headers:", Object.fromEntries(req.headers.entries()));

        // Mengambil signature dari header request
        const signature = req.headers.get("x-callback-token");
        console.log("Signature from header:", signature);

        // Mengambil body request dalam bentuk text
        const body = await req.text();
        console.log("Raw Body:", body);
        console.log("Body length:", body.length);

        // Memverifikasi keberadaan signature
        if (!signature) {
            console.error("No signature provided in headers");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // Memverifikasi kebenaran signature
        if (!verifyWebhookSignature(signature)) {
            console.error("Signature verification failed");
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }

        // Mengubah body text menjadi object JavaScript
        const payload = JSON.parse(body);
        console.log("Parsed Payload:", JSON.stringify(payload, null, 2));

        // Mengekstrak event dan data dari payload
        const { event, data } = payload;
        console.log("Event Type:", event);
        console.log("Event Data:", JSON.stringify(data, null, 2));

        // Menangani event testing khusus
        if (event === "testing") {
            console.log("Received testing event, sending success response");
            return NextResponse.json({ success: true });
        }

        // Mengambil email pengguna dari data webhook
        const userEmail = data.customerEmail || data.customer?.email;
        console.log("Looking for user with email:", userEmail);

        // Memastikan email pengguna tersedia
        if (!userEmail) {
            console.error("No customer email found in payload");
            return NextResponse.json(
                { error: "No customer email provided" },
                { status: 400 }
            );
        }

        // Mencari user di database berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email: userEmail },
        });

        // Menangani kasus user tidak ditemukan
        if (!user) {
            console.error("User not found:", userEmail);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        console.log("Found user:", user.id);

        // Menangani berbagai jenis event webhook
        switch (event) {
            case "payment.success":
            case "payment.received": {
                // Menangani event pembayaran berhasil
                console.log("Processing payment event");
                // Menentukan jenis paket berdasarkan nama tier
                const packageType = data.membershipTierName
                    ?.toLowerCase()
                    .includes("silver")
                    ? "silver"
                    : "gold";
                console.log("Package Type:", packageType);
                // Menambahkan token sesuai paket
                await addTokensByPackage(user.id, packageType);
                console.log("Tokens added successfully");
                break;
            }

            case "subscription.activated": {
                // Menangani event aktivasi subscription
                console.log("Processing subscription.activated");
                // Memperbarui data subscription user
                await updateSubscription(
                    user.id,
                    data.licenseCode,
                    new Date(data.expiredAt)
                );
                console.log("Subscription updated successfully");
                break;
            }

            default:
                console.log("Unhandled event type:", event);
        }

        console.log("=== WEBHOOK DEBUG END ===");

        // Mengirim response sukses
        return NextResponse.json({ success: true });
    } catch (error) {
        // Menangani dan mencatat error yang terjadi
        console.error("Webhook error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
