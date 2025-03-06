"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { Coins, MessageCircle, Send, User } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function Chat() {
	const {
		messages,
		input,
		handleInputChange,
		handleSubmit: handleChatSubmit,
		isLoading: isChatLoading,
	} = useChat({
		api: "/api/chat",
		onError: (error) => {
			// Revert optimistic update if error is about tokens
			if (error.message === "Insufficient tokens") {
				setTokens((prevTokens) => prevTokens + 1);
			}
			toast.error(error.message || "Terjadi kesalahan");
		},
	});

	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const lastMessageRef = useRef<string>("");
	const [tokens, setTokens] = useState<number>(0);
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	// Fetch token count
	const fetchTokens = useCallback(async () => {
		try {
			const response = await fetch("/api/chat/token");
			const data = await response.json();

			if (response.ok) {
				setTokens(data.remaining);
			} else {
				console.error("Error fetching tokens:", data.error);
				toast.error("Gagal mengambil data token");
			}
		} catch (error) {
			console.error("Error fetching tokens:", error);
			toast.error("Gagal mengambil data token");
		} finally {
			setIsInitialLoad(false);
		}
	}, []);

	// Load tokens on mount
	useEffect(() => {
		fetchTokens();
	}, [fetchTokens]);

	// Optimistic token update
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (tokens <= 0) {
			toast.error(
				"Token Anda habis! Silakan hubungi admin untuk menambah token.",
			);
			return;
		}

		// Optimistic update
		setTokens((prev) => prev - 1);

		try {
			await handleChatSubmit(e);
		} catch (error) {
			console.error("Error:", error);
			// Token will be reverted by onError callback if needed
		}
	};

	// Scroll to bottom function
	const scrollToBottom = useCallback(() => {
		const scrollArea = scrollAreaRef.current;
		if (scrollArea) {
			const scrollContainer = scrollArea.querySelector(
				"[data-radix-scroll-area-viewport]",
			);
			if (scrollContainer) {
				setTimeout(() => {
					scrollContainer.scrollTop = scrollContainer.scrollHeight;
				}, 100);
			}
		}
	}, []);

	// Auto scroll to bottom when new message arrives
	useEffect(() => {
		const currentLastMessage = messages[messages.length - 1]?.content;
		if (currentLastMessage && currentLastMessage !== lastMessageRef.current) {
			lastMessageRef.current = currentLastMessage;
			scrollToBottom();
		}
	}, [messages, scrollToBottom]);

	return (
		<div className="flex h-[calc(100vh-4rem)] flex-col items-center">
			<Card className="flex h-full w-full flex-col overflow-hidden rounded-none border-0 shadow-none md:rounded-lg md:border md:shadow-md">
				{/* Header */}
				<div className="border-b px-4 py-3 md:px-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<MessageCircle className="h-5 w-5 text-primary" />
							<h2 className="text-lg font-semibold">Chat AI</h2>
						</div>
						<div
							className={cn(
								"flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors duration-200",
								isInitialLoad
									? "bg-muted"
									: tokens > 5
										? "bg-muted"
										: "bg-red-100 dark:bg-red-900/20",
							)}
						>
							<Coins
								className={cn(
									"h-4 w-4",
									isInitialLoad
										? "text-primary"
										: tokens > 5
											? "text-primary"
											: "text-red-500",
								)}
							/>
							<span
								className={cn(
									"text-sm font-medium",
									isInitialLoad ? "" : tokens > 5 ? "" : "text-red-500",
								)}
							>
								{isInitialLoad ? "Memuat..." : `${tokens} Token Tersisa`}
							</span>
						</div>
					</div>
				</div>

				{/* Chat Area */}
				<CardContent className="flex-1 overflow-hidden p-0">
					<ScrollArea ref={scrollAreaRef} className="h-full">
						<div className="flex flex-col gap-6 px-4 py-6 md:px-6">
							{messages.map((message) => (
								<div
									key={message.id}
									className={cn(
										"flex w-full gap-3 md:gap-4",
										message.role === "user" ? "justify-end" : "justify-start",
									)}
								>
									<div
										className={cn(
											"flex max-w-[80%] items-start gap-3 md:max-w-[70%]",
											message.role === "user" ? "flex-row-reverse" : "flex-row",
										)}
									>
										<Avatar className="mt-0.5 h-8 w-8 shrink-0 md:h-9 md:w-9">
											{message.role === "user" ? (
												<>
													<AvatarImage src="/images/avatar/user.jpg" />
													<AvatarFallback className="bg-primary text-primary-foreground">
														<User className="h-4 w-4" />
													</AvatarFallback>
												</>
											) : (
												<>
													<AvatarImage src="/images/avatar/ai.jpg" />
													<AvatarFallback className="bg-zinc-800 text-zinc-100">
														AI
													</AvatarFallback>
												</>
											)}
										</Avatar>
										<div
											className={cn(
												"flex flex-col gap-1",
												message.role === "user" ? "items-end" : "items-start",
											)}
										>
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium">
													{message.role === "user" ? "Anda" : "AI Assistant"}
												</span>
											</div>
											<div
												className={cn(
													"rounded-2xl px-4 py-2.5",
													message.role === "user"
														? "bg-primary text-primary-foreground"
														: "bg-muted",
												)}
											>
												{message.toolInvocations ? (
													<pre className="whitespace-pre-wrap font-mono text-xs bg-black/5 dark:bg-white/5 rounded p-2">
														{JSON.stringify(message.toolInvocations, null, 2)}
													</pre>
												) : (
													<p className="text-sm leading-relaxed">
														{message.content}
													</p>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</ScrollArea>
				</CardContent>

				{/* Input Area */}
				<div className="border-t bg-background px-4 py-3 md:px-6">
					<form onSubmit={handleSubmit} className="flex items-center gap-3">
						<Input
							value={input}
							onChange={handleInputChange}
							placeholder={
								tokens <= 0 ? "Token Anda habis" : "Ketik pesan Anda..."
							}
							className="flex-1"
							disabled={tokens <= 0 || isChatLoading}
						/>
						<Button
							type="submit"
							size="icon"
							className="h-10 w-10 shrink-0 rounded-full"
							disabled={tokens <= 0 || isChatLoading}
						>
							<Send className="h-4 w-4" />
							<span className="sr-only">Kirim pesan</span>
						</Button>
					</form>
				</div>
			</Card>
		</div>
	);
}
