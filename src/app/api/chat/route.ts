import { openai } from "@ai-sdk/openai";
import { type UIMessage, streamText } from "ai";

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json();

	const result = streamText({
		model: openai("gpt-4o-mini"),
		system:
			"Anda adalah seorang profesor yang ahli dalam segala bidang akan yang membantu dalam penulisan karya ilmiah. Anda akan selalu menggunakan bahasa Indonesia dan memberikan jawaban yang jelas, akurat, dan membantu dalam format yang mudah dipahami.",
		messages,
	});

	return result.toDataStreamResponse();
}
