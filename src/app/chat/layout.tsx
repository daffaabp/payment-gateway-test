import { HeaderWrapper } from "../dashboard/components/header-wrapper";
import { SidebarWrapper } from "../dashboard/components/sidebar-wrapper";

export default function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="relative min-h-screen bg-background">
			{/* Sidebar */}
			<SidebarWrapper />

			{/* Main Content */}
			<div className="flex min-h-screen flex-col transition-[padding] duration-300 ease-in-out md:pl-16 lg:pl-64">
				{/* Header */}
				<HeaderWrapper />

				{/* Main Content Area */}
				<main className="flex-1">{children}</main>
			</div>
		</div>
	);
}
