import { prisma } from "@/lib/prisma";

// Fungsi untuk menambah token berdasarkan paket
export async function addTokensByPackage(userId: string, packageType: string) {
	const tokenAmount = packageType === "silver" ? 5 : 100;

	await prisma.chatToken.upsert({
		where: { userId },
		create: { userId, remaining: tokenAmount },
		update: { remaining: { increment: tokenAmount } },
	});
}

// Fungsi untuk verifikasi lisensi
export async function verifyLicense(licenseCode: string) {
	try {
		const response = await fetch(
			"https://api.mayar.id/saas/v1/license/verify",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.MAYAR_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					licenseCode,
					productId: process.env.MAYAR_PRODUCT_ID,
				}),
			},
		);

		return await response.json();
	} catch (error) {
		console.error("License verification error:", error);
		return null;
	}
}

// Fungsi untuk update subscription
export async function updateSubscription(
	userId: string,
	licenseCode: string,
	expiredAt: Date,
) {
	await prisma.userSubscription.create({
		data: {
			userId,
			licenseCode,
			expiredAt,
			isActive: true,
		},
	});
}
