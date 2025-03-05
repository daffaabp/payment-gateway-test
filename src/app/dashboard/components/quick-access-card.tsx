"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { BookText, Sparkles } from "lucide-react";
import Link from "next/link";

export function QuickAccessCard() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{/* About Wulang AI Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<BookText className="w-4 h-4 text-muted-foreground" />
						<CardTitle className="text-base">Tentang Wulang AI</CardTitle>
					</div>
					<CardDescription>
						Asisten AI untuk penulisan karya ilmiah Anda
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground mb-4">
						Wulang AI adalah platform inovatif yang membantu Anda menulis karya ilmiah dengan bantuan kecerdasan buatan. Tingkatkan kualitas penulisan akademik Anda dengan mudah dan efisien.
					</p>
					<Button asChild className="w-full">
						<Link href="/about">Pelajari Lebih Lanjut</Link>
					</Button>
				</CardContent>
			</Card>

			{/* Features Card */}
			<Card>
				<CardHeader>
					<div className="flex items-center gap-2">
						<Sparkles className="w-4 h-4 text-primary" />
						<CardTitle className="text-base">Fitur Unggulan</CardTitle>
					</div>
					<CardDescription>
						Manfaatkan teknologi AI untuk karya ilmiah berkualitas
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground mb-4">
						Nikmati berbagai fitur canggih seperti penulisan otomatis, penyuntingan cerdas, dan format akademik yang sesuai standar. Mulai tingkatkan produktivitas penulisan Anda sekarang.
					</p>
					<Button asChild className="w-full">
						<Link href="/chat">Lihat Fitur</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
