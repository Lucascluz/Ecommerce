import { useState, useTransition } from 'react';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import {
	toggleProductAvailability,
	deleteProduct,
} from '../../actions/products';

export function ActiveToggleDropdownItem({
	id,
	isAvailable,
	onUpdate,
}: {
	id: string;
	isAvailable: boolean;
	onUpdate: () => void;
}) {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	router.refresh();
	return (
		<DropdownMenuItem
			disabled={isPending}
			onClick={() => {
				startTransition(async () => {
					try {
						await toggleProductAvailability(id, !isAvailable);
						onUpdate();
					} catch (error) {
						console.error('Failed to toggle product availability:', error);
					}
				});
			}}>
			{isAvailable ? 'Deactivate' : 'Activate'}
		</DropdownMenuItem>
	);
}

export function DeleteDropDownItem({
	id,
	disabled,
	onUpdate,
}: {
	id: string;
	disabled: boolean;
	onUpdate: () => void;
}) {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	router.refresh();

	return (
		<DropdownMenuItem
			variant='destructive'
			disabled={disabled || isPending}
			onClick={() => {
				startTransition(async () => {
					try {
						await deleteProduct(id);
						onUpdate();
					} catch (error) {
						console.error('Failed to delete product:', error);
					}
				});
			}}>
			Delete
		</DropdownMenuItem>
	);
}
