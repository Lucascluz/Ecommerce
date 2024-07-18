'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '../_components/pageHeader';
import Link from 'next/link';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	DropdownMenu,
	DropdownMenuItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { CheckCircle2, MoreVertical, XCircle } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/formatter';
import {
	ActiveToggleDropdownItem,
	DeleteDropDownItem,
} from './_components/ProductActions';

type Product = {
	id: string;
	name: string;
	priceInCents: number;
	isAvailable: boolean;
	_count: {
		orders: number;
	};
};

export default function AdminProductsPage() {
	const [products, setProducts] = useState<Product[]>([]);

	useEffect(() => {
		const fetchProducts = async () => {
			const response = await fetch('/api/products');
			if (!response.ok) {
				console.error('Failed to fetch products');
				return;
			}
			const data: Product[] = await response.json();
			setProducts(data);
		};
		fetchProducts();
	}, []);

	const handleUpdate = async () => {
		const response = await fetch('/api/products');
		if (!response.ok) {
			console.error('Failed to fetch products');
			return;
		}
		const data: Product[] = await response.json();
		setProducts(data);
	};

	return (
		<>
			<div className='flex justify-between items-center gap-4'>
				<PageHeader>Products</PageHeader>
				<Button asChild>
					<Link href='/admin/products/new'>Add Product</Link>
				</Button>
			</div>
			<ProductsTable products={products} onUpdate={handleUpdate} />
		</>
	);
}

function ProductsTable({
	products,
	onUpdate,
}: {
	products: Product[];
	onUpdate: () => void;
}) {
	if (products.length === 0) return <p>No Products Found</p>;

	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead className='w-0'>
						<span className='sr-only'>Available For Purchase</span>
					</TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Price</TableHead>
					<TableHead>Orders</TableHead>
					<TableHead className='w-0'>
						<span className='sr-only'>Actions</span>
					</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{products.map((product) => (
					<TableRow key={product.id}>
						<TableCell>
							{product.isAvailable ? (
								<>
									<span className='sr-only'>Available</span>
									<CheckCircle2 />
								</>
							) : (
								<>
									<span className='sr-only'>Unavailable</span>
									<XCircle className='stroke-destructive' />
								</>
							)}
						</TableCell>
						<TableCell>{product.name}</TableCell>
						<TableCell>{formatCurrency(product.priceInCents / 100)}</TableCell>
						<TableCell>{formatNumber(product._count.orders)}</TableCell>
						<TableCell>
							<DropdownMenu>
								<DropdownMenuTrigger>
									<MoreVertical />
									<span className='sr-only'>Actions</span>
								</DropdownMenuTrigger>
								<DropdownMenuContent>
									<DropdownMenuItem asChild>
										<a download href={`/admin/products/${product.id}/download`}>
											Download
										</a>
									</DropdownMenuItem>
									<DropdownMenuItem asChild>
										<Link href={`/admin/products/${product.id}/edit`}>Edit</Link>
									</DropdownMenuItem>
									<ActiveToggleDropdownItem
										id={product.id}
										isAvailable={product.isAvailable}
										onUpdate={onUpdate}
									/>
									<DropdownMenuSeparator />
									<DeleteDropDownItem
										id={product.id}
										disabled={product._count.orders > 0}
										onUpdate={onUpdate}
									/>
								</DropdownMenuContent>
							</DropdownMenu>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
