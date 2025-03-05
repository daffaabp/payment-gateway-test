"use server";

import { verifyPassword } from "@/lib/password-utils";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action";
import { getSession } from "@/lib/sessions";
import { returnValidationErrors } from "next-safe-action";
import { loginSchema } from "./login-validations";

export const loginAction = actionClient
	.schema(loginSchema)
	.action(async ({ parsedInput }) => {
		return await prisma.$transaction(async (tx) => {
			// Regular user login flow
			const user = await tx.user.findUnique({
				where: {
					email: parsedInput.email,
				},
			});

			// Return error if user not found
			if (!user) {
				returnValidationErrors(loginSchema, {
					_errors: ["Invalid email or password"],
				});
			}

			// Verify password matches
			const isValidPassword = await verifyPassword(
				parsedInput.password,
				user?.hashedPassword || "",
			);

			// Return error if password invalid
			if (!isValidPassword) {
				returnValidationErrors(loginSchema, {
					_errors: ["Invalid email or password"],
				});
			}

			// Create and save user session
			const session = await getSession();
			session.email = user.email;
			session.userId = user.id;
			await session.save();

			// Return success response
			return {
				success: true,
				message: "Login successful",
			};
		});
	});
