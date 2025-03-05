import { Container } from "@/components/shared/container";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/sessions";
import { QuickAccessCard } from "./components/quick-access-card";

export default async function DashboardPage() {
	const session = await getSession();

	// Get user profile data
	const profile = await prisma.userProfile.findFirst({
		where: {
			userId: session.userId,
		},
		select: {
			firstName: true,
			lastName: true,
		},
	});

	return (
		<Container variant="default">
			<div className="space-y-6">
				{/* Welcome Section */}
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Selamat datang, {profile?.firstName} {profile?.lastName}
					</h1>
					<p className="text-muted-foreground">
						Selamat datang di AIK Membership.
					</p>
				</div>

				{/* Quick Access */}
				<div>
					<div>
						<h2 className="text-lg font-semibold">Wulang AI</h2>
						<p className="text-sm text-muted-foreground">
							Asisten AI untuk penulisan karya ilmiah Anda
						</p>
					</div>
					<div className="mt-4">
						<QuickAccessCard />
					</div>
				</div>
			</div>
		</Container>
	);
}
