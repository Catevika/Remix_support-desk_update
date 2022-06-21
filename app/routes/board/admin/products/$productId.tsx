import type { LoaderFunction, ActionFunction, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
	Link,
	useLoaderData,
	useCatch,
	useParams
} from '@remix-run/react';
import { prisma } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';
import DeleteButton from '~/components/DeleteButton';
import { User } from '@prisma/client';

export const meta: MetaFunction = ({
	data
}: {
	data: LoaderData | undefined;
}) => {
	if (!data) {
		return {
			title: 'No product',
			description: 'No product found'
		};
	}
	return {
		title: `Support-Desk | Product | ${data.device}`,
		description: `Here ist the "${data.device}"created by ${data.username}`
	};
};

type LoaderData = {
	id: string;
	username: string;
	device: string;
	isOwner: boolean;
	canDelete: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const userId = await getUserId(request);
	const product = await prisma.product.findUnique({
		where: { productId: params.productId }
	});

	const users = await prisma.user.findMany({
		select: { id: true, username: true }
	});

	const user = users.filter((user) => user.id === product?.authorId)[0];

	const { id, username } = user;

	if (!username || !id) {
		throw new Response('User Not Found.', {
			status: 404
		});
	}

	if (!product) {
		throw new Response('Product Not Found.', {
			status: 404
		});
	}

	if (!user) {
		throw new Response('User Not Found.', {
			status: 404
		});
	}

	const data: LoaderData = {
		id,
		username,
		device: product.device,
		isOwner: userId === product.authorId,
		canDelete: true
	};
	return json(data);
};

export const action: ActionFunction = async ({ request, params }) => {
	const form = await request.formData();
	if (form.get('_method') !== 'delete') {
		throw new Response(`The _method ${form.get('_method')} is not supported`, {
			status: 400
		});
	}
	const userId = await requireUserId(request);
	const product = await prisma.product.findUnique({
		where: { productId: params.productId }
	});

	if (!product) {
		throw new Response("Can't delete what does not exist", {
			status: 404
		});
	}

	if (product.authorId !== userId) {
		throw new Response("Can't delete a product that is not yours", {
			status: 401
		});
	}
	await prisma.product.delete({ where: { productId: params.productId } });
	return redirect('/board/admin/products/new-product');
};

export default function ProductRoute() {
	const data = useLoaderData() as LoaderData;

	return (
		<>
			<main className='form-container'>
				{data.username && (
					<p>
						Product created by{' '}
						<span className='capitalize'>{data.username}</span>
					</p>
				)}
				<div className='form-content'>
					<p>{data.device}</p>
					<DeleteButton isOwner={data.isOwner} canDelete={data.isOwner ? data.canDelete : false} />
				</div>
				<Link to='/board/admin/products/new-product'>
					<button className='btn form-btn'>Back to Create Product</button>
				</Link>
			</main>
		</>
	);
}

export function CatchBoundary() {
	const caught = useCatch();
	const params = useParams();
	switch (caught.status) {
		case 400: {
			return (
				<div className='error-container'>
					<div className='form-container form-content'>
						What you're trying to do is not allowed.
					</div>
				</div>
			);
		}
		case 404: {
			return (
				<div className='error-container'>
					<div className='form-container form-content'>
						{params.productId} does not exist.
					</div>
				</div>
			);
		}
		case 401: {
			return (
				<div className='error-container'>
					<div className='form-container form-content'>
						Sorry, but {params.productId} is not your product.
					</div>
				</div>
			);
		}
		default: {
			throw new Error(`Unhandled error: ${caught.status}`);
		}
	}
}

export function ErrorBoundary({ error }: { error: Error; }) {
	console.error(error);
	const { productId } = useParams();
	return (
		<div className='error-container'>
			<div className='form-container form-content'>
				There was an error loading the product by the id:{' '}
				<p>
					{' '}
					<span>{`${productId}.`}</span>
				</p>
				<p>Sorry.</p>
			</div>
		</div>
	);
}
