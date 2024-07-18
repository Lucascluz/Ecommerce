'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/formatter';
import { Button } from '@/components/ui/button';
import { addProduct, updateProduct } from '../../actions/products';
import { useFormState, useFormStatus } from 'react-dom';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@prisma/client';
import Image from 'next/image';

export function ProductForm({ product }: { product?: Product | null }) {
	const [error, action] = useFormState(
		product == null ? addProduct : updateProduct.bind(null, product.id),
		{}
	);
	const [priceInCents, setPriceInCents] = useState<number | undefined>(
		product?.priceInCents
	);

	return (
		<form action={action} className='space-y-8'>
			<div className='space-y-2'>
				<Label htmlFor='name'>Name</Label>
				<Input
					type='text'
					id='name'
					name='name'
					required
					defaultValue={product?.name || ''}
				/>
				{error.name && <div className='text-destructive'>{error.name}</div>}
			</div>
			<div className='space-y-2'>
				<Label htmlFor='priceInCents'>Price In Cents</Label>
				<Input
					type='text'
					id='priceInCents'
					name='priceInCents'
					required
					value={priceInCents}
					onChange={(e) => setPriceInCents(Number(e.target.value) || undefined)}
				/>
			</div>
			<div className='text-muted-foreground'>
				{formatCurrency((priceInCents || 0) / 100)}
			</div>
			{error.priceInCents && (
				<div className='text-destructive'>{error.priceInCents}</div>
			)}
			<div className='space-y-2'>
				<Label htmlFor='description'>Description</Label>
				<Textarea
					id='description'
					name='description'
					required
					defaultValue={product?.description || ''}
				/>
				{error.description && (
					<div className='text-destructive'>{error.description}</div>
				)}
			</div>
			<div className='space-y-2'>
				<Label htmlFor='file'>File</Label>
				<Input type='file' id='file' name='file' required={product == null} />
				{product != null && (
					<div className='text-muted-foreground'>{product.filePath}</div>
				)}
				{error.file && <div className='text-destructive'>{error.file}</div>}
			</div>

			<ImageInput product={product} error={error} />

			<SubmitButton />
		</form>
	);
}

function SubmitButton() {
	const { pending } = useFormStatus();
	return (
		<Button type='submit' disabled={pending}>
			{pending ? 'Saving...' : 'Save'}
		</Button>
	);
}

function ImageInput({ product, error }: { product?: Product | null, error: any }) {
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setSelectedImage(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className='space-y-4'>
			<div className='space-y-2'>
				<Label htmlFor='image'>Image</Label>
				<Input
					type='file'
					id='image'
					name='image'
					required={product == null}
					onChange={handleImageChange}
				/>
				{error.image && <div className='text-destructive'>{error.image}</div>}
			</div>

			<div className='flex space-x-4m justify-center items-center'>
				<div className='flex flex-col justify-center items-center h-full'>
					{product && (
						<>
							<div className='mb-4'>
								<Label>Imagem Atual</Label>
							</div>
							<Image
								className='flex align-center'
								src={`/${product.imagePath}`}
								height={400}
								width={400}
								alt={'Falha ao Carregar Imagem'}
							/>
						</>
					)}
				</div>

				{selectedImage && (
					<div className='flex flex-col justify-center items-center h-full'>
						<div className='mb-4'>
							<Label>Imagem Selecionada</Label>
						</div>
						<Image
							className='flex align-center'
							src={selectedImage}
							height={400}
							width={400}
							alt={'Imagem Selecionada'}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
