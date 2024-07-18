'use server';

import db from '@/db/db';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { z } from 'zod';
import { notFound, redirect } from 'next/navigation';

const fileSchema = z.instanceof(File, { message: 'Required' });
const imageSchema = fileSchema.refine(
	(file) => file.size > 0 && file.type.startsWith('image/'),
	{ message: 'Invalid image file' }
);

async function saveFile(file: File, dir: string): Promise<string> {
	const uniqueName = `${crypto.randomUUID()}-${file.name}`;
	const filePath = path.join(process.cwd(), dir, uniqueName);

	console.log(`Saving file to: ${filePath}`); // Debugging statement

	await fs.mkdir(path.dirname(filePath), { recursive: true });
	await fs.writeFile(filePath, Buffer.from(await file.arrayBuffer()));

	console.log(`File saved: ${filePath}`); // Debugging statement

	return uniqueName;
}

const addSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1),
	priceInCents: z.coerce.number().int().min(1),
	file: fileSchema,
	image: imageSchema,
});

export async function addProduct(prevState: unknown, formData: FormData) {
	const results = addSchema.safeParse(Object.fromEntries(formData.entries()));
	if (!results.success) {
		return results.error.formErrors.fieldErrors;
	}
	const data = results.data;

	const fileName = await saveFile(data.file, 'products');
	const imageName = await saveFile(data.image, 'public/products');

	await db.product.create({
		data: {
			isAvailable: false,
			name: data.name,
			description: data.description,
			priceInCents: data.priceInCents,
			filePath: `products/${fileName}`,
			imagePath: `products/${imageName}`,
		},
	});

	redirect('/admin/products/');
}

const editSchema = addSchema.extend({
	file: fileSchema.optional(),
	image: imageSchema.optional(),
});

export async function updateProduct(
	id: string,
	prevState: unknown,
	formData: FormData
) {
	const results = editSchema.safeParse(Object.fromEntries(formData.entries()));
	if (!results.success) {
		return results.error.formErrors.fieldErrors;
	}

	const data = results.data;
	const product = await db.product.findUnique({ where: { id } });

	if (product == null) return notFound();

	let filePath = product.filePath;
	if (data.file != null && data.file.size > 0) {
		await fs.unlink(filePath);
		filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
		await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
	}

	let imagePath = product.imagePath;
	if (data.image != null && data.image.size > 0) {
		await fs.unlink(`public/${imagePath}`);
		imagePath = `products/${crypto.randomUUID()}-${data.image.name}`;
		await fs.writeFile(
			`public/${imagePath}`,
			Buffer.from(await data.image.arrayBuffer())
		);
	}

	await db.product.update({
		where: { id },
		data: {
			name: data.name,
			description: data.description,
			priceInCents: data.priceInCents,
			filePath,
			imagePath,
		},
	});
	redirect('/admin/products/');
}

export async function toggleProductAvailability(
	id: string,
	isAvailable: boolean
) {
	await db.product.update({
		where: { id },
		data: {
			isAvailable,
		},
	});
}

export async function deleteProduct(id: string) {
	const product = await db.product.delete({ where: { id } });
	if (product === null) return notFound();

	await fs.unlink(path.join(process.cwd(), product.filePath));
	await fs.unlink(path.join(process.cwd(), product.imagePath));
}
