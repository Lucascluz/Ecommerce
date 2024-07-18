import { NextApiRequest, NextApiResponse } from 'next';
import db from '@/db/db'; // Adjust this import if necessary

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		const products = await db.product.findMany({
			select: {
				id: true,
				name: true,
				priceInCents: true,
				isAvailable: true,
				_count: { select: { orders: true } },
			},
			orderBy: { name: 'asc' },
		});
		res.status(200).json(products);
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch products' });
	}
}
