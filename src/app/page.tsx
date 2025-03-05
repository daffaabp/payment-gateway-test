import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
	return (
		<Container variant="centered">
			<div className="w-full max-w-5xl mx-auto space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-bold">
						Selamat Datang di Wulang AI
					</h1>
					<p className="text-muted-foreground">
						Asisten Pintar untuk Penulisan Karya Ilmiah
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Link href="/auth/login" className="block group">
						<Card className="h-full transition-colors hover:border-primary">
							<CardHeader>
								<CardTitle>Panduan Penulisan</CardTitle>
								<CardDescription>
									Bantuan penulisan karya ilmiah
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Dapatkan panduan langkah demi langkah dalam menulis skripsi, tesis, 
									disertasi dan berbagai jenis karya ilmiah lainnya.
								</p>
							</CardContent>
						</Card>
					</Link>

					<Link href="/auth/forgot-password" className="block group">
						<Card className="h-full transition-colors hover:border-primary">
							<CardHeader>
								<CardTitle>AI Writing Assistant</CardTitle>
								<CardDescription>
									Asisten AI untuk penulisan
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Manfaatkan teknologi AI untuk membantu proses penulisan, 
									penyuntingan, dan penyempurnaan karya ilmiah Anda.
								</p>
							</CardContent>
						</Card>
					</Link>

					<Link href="/dashboard" className="block group">
						<Card className="h-full transition-colors hover:border-primary">
							<CardHeader>
								<CardTitle>Referensi & Sitasi</CardTitle>
								<CardDescription>Kelola referensi dengan mudah</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground">
									Kelola daftar pustaka dan sitasi secara otomatis sesuai dengan 
									berbagai gaya penulisan seperti APA, MLA, dan lainnya.
								</p>
							</CardContent>
						</Card>
					</Link>
				</div>

				<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
					<Button asChild size="lg">
						<Link href="/auth/login">Mulai Menulis</Link>
					</Button>
					<Button asChild variant="outline" size="lg">
						<Link href="/auth/register">Daftar Sekarang</Link>
					</Button>
					<Button asChild variant="secondary" size="lg">
						<Link href="/dashboard">Area Kerja</Link>
					</Button>
				</div>
			</div>
		</Container>
	);
}
