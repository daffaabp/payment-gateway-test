"use client";

import { cn } from "@/lib/utils";
import type * as React from "react";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
	fallback: string;
}

export function Avatar({ fallback, className, ...props }: AvatarProps) {
	return (
		<div
			className={cn(
				"relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted",
				className,
			)}
			{...props}
		>
			<span className="flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground">
				{fallback.charAt(0)}
			</span>
		</div>
	);
}
