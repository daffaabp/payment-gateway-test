import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { openai } from "@ai-sdk/openai";
import { type UIMessage, streamText } from "ai";

export async function POST(req: Request) {
	try {
		const { messages }: { messages: UIMessage[] } = await req.json();
		const session = await getSession();

		if (!session.userId) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
			});
		}

		// Check and use token in a transaction
		const result = await prisma.$transaction(async (tx) => {
			// Get user's token
			const token = await tx.chatToken.findUnique({
				where: { userId: session.userId },
			});

			if (!token || token.remaining <= 0) {
				throw new Error("Insufficient tokens");
			}

			// Update token count
			await tx.chatToken.update({
				where: { userId: session.userId },
				data: { remaining: token.remaining - 1 },
			});

			// Generate chat response
			return streamText({
				model: openai("gpt-4o-mini"),
				system:
					"Anda adalah seorang profesor yang ahli dalam segala bidang akan yang membantu dalam penulisan karya ilmiah. Anda akan selalu menggunakan bahasa Indonesia dan memberikan jawaban yang jelas, akurat, dan membantu dalam format yang mudah dipahami.",
				messages,
			});
		});

		return result.toDataStreamResponse();
	} catch (error) {
		console.error("Chat error:", error);
		return new Response(
			JSON.stringify({
				error: error instanceof Error ? error.message : "Internal server error",
			}),
			{
				status:
					error instanceof Error && error.message === "Insufficient tokens"
						? 403
						: 500,
			},
		);
	}
}
