import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { openai } from "@ai-sdk/openai";
import { type UIMessage, streamText } from "ai";

// Mendefinisikan endpoint POST untuk menerima request chat
export async function POST(req: Request) {
	try {
		// Mengambil pesan chat dari body request
		const { messages }: { messages: UIMessage[] } = await req.json();
		// Mendapatkan sesi user yang aktif
		const session = await getSession();

		// Cek apakah user sudah login dengan memeriksa userId
		if (!session.userId) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401, // Status 401 menandakan user belum terautentikasi
			});
		}

		// Melakukan transaksi database untuk mengecek dan menggunakan token
		const result = await prisma.$transaction(async (tx) => {
			// Mencari token chat user berdasarkan userId
			const token = await tx.chatToken.findUnique({
				where: { userId: session.userId },
			});

			// Jika token tidak ada atau habis, lempar error
			if (!token || token.remaining <= 0) {
				throw new Error("Insufficient tokens");
			}

			// Mengurangi jumlah token yang tersisa
			await tx.chatToken.update({
				where: { userId: session.userId },
				data: { remaining: token.remaining - 1 },
			});

			// Membuat response chat menggunakan OpenAI
			return streamText({
				model: openai("gpt-4o-mini"), // Menggunakan model GPT-4
				system:
					"Anda adalah seorang profesor yang ahli dalam segala bidang akan yang membantu dalam penulisan karya ilmiah. Anda akan selalu menggunakan bahasa Indonesia dan memberikan jawaban yang jelas, akurat, dan membantu dalam format yang mudah dipahami.",
				messages, // Mengirim pesan user ke AI
			});
		});

		// Mengembalikan response dalam format stream data
		return result.toDataStreamResponse();
	} catch (error) {
		// Mencatat error ke console untuk debugging
		console.error("Chat error:", error);
		// Mengembalikan response error yang sesuai
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : "Internal server error",
			}),
			{
				status:
					error instanceof Error && error.message === "Insufficient tokens"
						? 403 // Status 403 untuk token habis
						: 500, // Status 500 untuk error internal lainnya
			},
		);
	}
}
