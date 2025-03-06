"use server";

import { hashPassword } from "@/lib/password-utils";
import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action";
import { getSession } from "@/lib/sessions";
import { returnValidationErrors } from "next-safe-action";
import { registerResponseSchema, registerSchema } from "./register-validations";

// Mendefinisikan action untuk proses registrasi pengguna baru
export const registerAction = actionClient
	// Menggunakan skema untuk memvalidasi data input dari form registrasi
	.schema(registerSchema)
	// Menggunakan skema untuk memvalidasi data yang akan dikembalikan ke client
	.outputSchema(registerResponseSchema)
	// Mendefinisikan fungsi async yang akan dijalankan saat form registrasi disubmit
	.action(async ({ parsedInput }) => {
		// Menggunakan transaksi database untuk memastikan semua operasi berhasil atau gagal bersama
		return await prisma.$transaction(async (tx) => {
			// Mencari apakah email sudah terdaftar di database
			const existingUser = await tx.user.findUnique({
				where: {
					email: parsedInput.email,
				},
			});

			// Jika email sudah terdaftar, kembalikan pesan error
			if (existingUser) {
				returnValidationErrors(registerSchema, {
					_errors: ["Email sudah terdaftar"],
				});
			}

			// Mengenkripsi password pengguna sebelum disimpan ke database
			const hashedPassword = await hashPassword(parsedInput.password);

			try {
				// Membuat record pengguna baru di database
				const newUser = await tx.user.create({
					data: {
						email: parsedInput.email,
						hashedPassword,
						// Membuat token chat secara otomatis saat pengguna mendaftar
						chatTokens: {
							create: {
								remaining: 15, // Jumlah token awal untuk pengguna baru
							},
						},
					},
					// Menyertakan data token chat dalam response
					include: {
						chatTokens: true,
					},
				});

				// Membuat dan menyimpan sesi pengguna untuk login otomatis
				const session = await getSession();
				session.email = newUser.email;
				session.userId = newUser.id;
				await session.save();

				// Mengembalikan response sukses ke client
				return {
					success: true,
					message: "Registrasi berhasil",
				};
			} catch (error) {
				// Mencatat error ke console untuk debugging
				console.error("Error saat registrasi:", error);
				throw error;
			}
		});
	});
