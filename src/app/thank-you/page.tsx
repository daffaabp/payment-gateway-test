"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

// Komponen untuk loading state
function LoadingCard() {
	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
					<Loader2 className="w-8 h-8 animate-spin" />
					<span>Memproses...</span>
				</CardTitle>
			</CardHeader>
			<CardContent className="text-center">
				<p className="text-muted-foreground">Mohon tunggu sebentar...</p>
			</CardContent>
		</Card>
	);
}

// Komponen utama yang menggunakan useSearchParams
function ThankYouContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Ambil parameter dari URL
	const licenseCode = searchParams.get("licenseCode");
	const name = searchParams.get("name");

	// Anggap pembayaran berhasil jika ada licenseCode
	const isPaid = !!licenseCode;

	// Auto redirect ke chat jika sukses setelah 5 detik
	useEffect(() => {
		if (isPaid) {
			const timer = setTimeout(() => {
				router.push("/chat");
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [isPaid, router]);

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
					{isPaid ? (
						<>
							<CheckCircle2 className="w-8 h-8 text-green-500" />
							<span>Pembayaran Berhasil!</span>
						</>
					) : (
						<>
							<XCircle className="w-8 h-8 text-red-500" />
							<span>Pembayaran Gagal</span>
						</>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent className="text-center space-y-4">
				{isPaid ? (
					<>
						<p className="text-green-600">
							Terima kasih telah berlangganan, {name}!
						</p>
						<p className="text-muted-foreground">
							Anda akan dialihkan ke halaman chat dalam 5 detik...
						</p>
						<p className="text-xs text-muted-foreground">
							License Code: {licenseCode}
						</p>
					</>
				) : (
					<p className="text-red-600">
						Mohon maaf, pembayaran Anda tidak berhasil. Silakan coba lagi.
					</p>
				)}
			</CardContent>
			<CardFooter className="flex justify-center">
				<Button onClick={() => router.push(isPaid ? "/chat" : "/dashboard")}>
					{isPaid ? "Ke Halaman Chat" : "Kembali ke Dashboard"}
				</Button>
			</CardFooter>
		</Card>
	);
}

// Halaman utama dengan Suspense boundary
export default function ThankYouPage() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<Suspense fallback={<LoadingCard />}>
				<ThankYouContent />
			</Suspense>
		</div>
	);
}
