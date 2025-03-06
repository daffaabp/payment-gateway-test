"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { toast } from "sonner";

interface PricingDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const plans = [
	{
		name: "Silver",
		price: "10.000",
		duration: "1 bulan",
		features: ["Akses ke fitur dasar AI", "5 total token", "Dukungan email"],
		discount: "25%",
		originalPrice: "13.000",
	},
	{
		name: "Gold",
		price: "30.000",
		duration: "12 bulan",
		features: [
			"Semua fitur Silver",
			"100 total token",
			"Prioritas dukungan",
			"Akses fitur premium",
			"Hemat 25% dibanding pembelian bulanan",
		],
		discount: "50%",
		originalPrice: "60.000",
		popular: true,
	},
];

export function PricingDialog({ open, onOpenChange }: PricingDialogProps) {
	const handleSelectPlan = async (planName: string) => {
		try {
			if (planName.toLowerCase() === "silver") {
				const paymentLink = process.env.NEXT_PUBLIC_PAYMENT_LINK;
				if (!paymentLink) {
					throw new Error("Payment link not configured");
				}
				// Direct redirect to Silver package payment link
				window.location.href = paymentLink;
			} else if (planName.toLowerCase() === "gold") {
				const paymentLink = process.env.NEXT_PUBLIC_PAYMENT_LINK;
				if (!paymentLink) {
					throw new Error("Payment link not configured");
				}
				// Direct redirect to Gold package payment link
				window.location.href = paymentLink;
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("Terjadi kesalahan. Silakan coba lagi.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[650px]">
				<DialogHeader>
					<DialogTitle className="text-2xl text-center">
						Pilih Paket Langganan
					</DialogTitle>
				</DialogHeader>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
					{plans.map((plan) => (
						<Card
							key={plan.name}
							className={cn(
								"relative flex flex-col",
								plan.popular && "border-primary shadow-lg",
							)}
						>
							{plan.popular && (
								<span className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded-full">
									Terpopuler
								</span>
							)}
							<CardHeader>
								<CardTitle className="text-xl">{plan.name}</CardTitle>
								<CardDescription>
									<div className="flex items-baseline gap-2">
										<span className="text-2xl font-bold">Rp{plan.price}</span>
										<span className="text-sm text-muted-foreground">
											/{plan.duration}
										</span>
									</div>
									<div className="mt-2">
										<span className="inline-block bg-red-100 text-red-600 text-sm font-medium px-2 py-1 rounded">
											Hemat {plan.discount}
										</span>
										<span className="ml-2 text-sm text-muted-foreground line-through">
											Rp{plan.originalPrice}
										</span>
									</div>
								</CardDescription>
							</CardHeader>
							<CardContent className="flex-1">
								<ul className="space-y-2">
									{plan.features.map((feature) => (
										<li key={feature} className="flex items-center gap-2">
											<Check className="h-4 w-4 text-primary flex-shrink-0" />
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>
							</CardContent>
							<CardFooter className="mt-auto">
								<Button
									className="w-full hover:opacity-90 transition-opacity"
									variant={plan.popular ? "default" : "outline"}
									onClick={() => handleSelectPlan(plan.name)}
								>
									Pilih {plan.name}
								</Button>
							</CardFooter>
						</Card>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
