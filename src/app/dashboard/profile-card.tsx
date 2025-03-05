"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { SessionData } from "@/lib/sessions";

export function ProfileCard({ session }: { session: SessionData }) {
	return (
		<Card className="h-full">
			<CardHeader className="pb-4">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle>Profil Pengguna</CardTitle>
						<CardDescription>Informasi detail akun Anda</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* User Info */}
				<div className="grid gap-4">
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">
							Nama Lengkap:
						</p>
						<p className="text-sm">
							{session.profile?.firstName} {session.profile?.lastName}
						</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">Email:</p>
						<p className="text-sm">{session.email}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">
							No. Telepon:
						</p>
						<p className="text-sm">{session.profile?.phone || "-"}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">
							Institusi:
						</p>
						<p className="text-sm">{session.profile?.institution || "-"}</p>
					</div>
					<div className="space-y-1">
						<p className="text-sm font-medium text-muted-foreground">Alamat:</p>
						<p className="text-sm">{session.profile?.address || "-"}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
