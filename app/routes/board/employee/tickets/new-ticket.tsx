import type { MetaFunction, LoaderFunction, ActionFunction } from '@remix-run/node';
import type { Product, Status } from '@prisma/client';
import { json, redirect } from '@remix-run/node';
import {
	useLoaderData,
	useActionData,
	Link,
	useFetcher,
	useCatch
} from '@remix-run/react';

import { getUser, requireUserId } from '~/utils/session.server';
import { prisma } from '~/utils/db.server';
import { getProducts } from '~/models/products.server';
import { getStatuses } from '~/models/status.server';
import { validateTitle, validateSelectedStatus, validateSelectedProduct, validateDescription } from '~/utils/functions';

// TODO: Add edit option - See Post from EGGHEAD.IO

export const meta: MetaFunction = () => {
	return {
		title: 'Support-Desk | Tickets'
	};
};

type LoaderData = {
	user: Awaited<ReturnType<typeof getUser>>;
	products: Awaited<ReturnType<typeof getProducts>>;
	statuses: Awaited<ReturnType<typeof getStatuses>>;
};

export const loader: LoaderFunction = async ({ request }) => {
	const [user, products, statuses] = await Promise.all([
		getUser(request),
		getProducts(),
		getStatuses()
	]);

	const data: LoaderData = {
		user,
		products,
		statuses
	};

	return data;
};

type ActionData = {
	formError?: string;
	fieldErrors?: {
		title: string | undefined;
		status: string | undefined;
		product: string | undefined;
		description: string | undefined;
	};
	fields?: {
		title: string;
		status: string;
		product: string;
		description: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
	const form = await request.formData();

	const title = form.get('title');
	const status = form.get('status');
	const product = form.get('product');
	const description = form.get('description');

	function onlyNumbers(str: string) {
		return /^[0-9]+$/.test(str);
	}

	if ((typeof title !== 'string') || onlyNumbers(title) === true) {
		return badRequest({ formError: 'The title must be at least 3 characters long.' });
	}

	if (typeof status !== 'string') {
		return badRequest({ formError: 'A status must be selected.' });
	}

	if (typeof product !== 'string') {
		return badRequest({ formError: 'A product must be selected.' });
	}

	if ((typeof description !== 'string') || onlyNumbers(description) === true) {
		return badRequest({ formError: 'Issue description must be at least 5 characters long.' });
	}

	const fieldErrors = {
		title: validateTitle(title),
		status: validateSelectedStatus(status),
		product: validateSelectedProduct(product),
		description: validateDescription(description),
	};

	const fields = { title, status, product, description };
	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	const userId = await requireUserId(request);

	const ticketProduct = await prisma.product.findUnique({
		where: { device: product }
	});

	if (!ticketProduct) {
		return badRequest({ formError: 'Product not found' });
	}

	const ticketProductId = ticketProduct.productId;

	const ticketStatus = await prisma.status.findUnique({ where: { type: status } });

	if (!ticketStatus) {
		return badRequest({ formError: 'Status not found' });
	}

	const ticketStatusId = ticketStatus.statusId;

	await prisma.ticket.create({
		data: {
			authorId: userId,
			ticketProductId,
			ticketStatusId,
			title,
			description
		}
	});
	return redirect(`/board/employee/tickets/new-ticket`);
};

export default function NewTicketRoute() {
	const data = useLoaderData() as LoaderData;
	const user = data.user;
	const statuses: Status[] = data.statuses;
	const products: Product[] = data.products;

	const actionData = useActionData() as ActionData;

	const fetcher = useFetcher();

	function handleSelectStatus(selectedStatus: string) {
		return fetcher.submission?.formData.get('status') === selectedStatus;
	}

	function handleSelectProduct(selectedProduct: string) {
		return fetcher.submission?.formData.get('product') === selectedProduct;
	}

	return (
		<>
			<main className='form-container'>
				<div className='form-content'>
					<p className='list'>
						New Ticket from:<span className='capitalize'>&nbsp;{user?.username}</span>
					</p>
					<p className='list'>
						Email:
						<span>&nbsp;{user?.email}</span>
					</p>
					<fetcher.Form reloadDocument method='post' className='form'>
						<div>
							<label htmlFor="title">
								Title:{''}
								<input
									type='text'
									id='title'
									name='title'
									defaultValue={actionData?.fields?.title}
									aria-invalid={Boolean(actionData?.fieldErrors?.title)}
									aria-errormessage={actionData?.fieldErrors?.title ? 'title-error' : undefined}
									autoFocus
								/>
							</label>
							{actionData?.fieldErrors?.title ? (
								<p
									className='error-danger'
									role='alert'
									id='title-error'
								>
									{actionData.fieldErrors.title}
								</p>
							) : null}
						</div>
						<div className='form-group'>
							<label htmlFor='status'>Status:
								{statuses.length ? (
									<select
										id='status'
										name='status'
										defaultValue='-- Please select a status --'
										onSelect={(e) => handleSelectStatus}
										className='form-select'
									>
										<option
											defaultValue='-- Please select a status --'
											disabled
											className='form-option-disabled'
										>
											-- Please select a status --
										</option>
										{statuses.map((status: Status) => (
											<option
												key={status.statusId}
												value={status.type}
												className='form-option'
											>
												{status.type}
											</option>
										))}
									</select>
								) : (
									<p className='error-danger'>'No status available'</p>
								)}
							</label>
						</div>
						<div className='form-group'>
							<label htmlFor='product'>Product:
								{products.length ? (
									<select
										id='product'
										name='product'
										defaultValue='-- Please select a product --'
										onSelect={(e) => handleSelectProduct}
										className='form-select'
									>
										<option
											defaultValue='-- Please select a product --'
											disabled
											className='form-option-disabled'
										>
											-- Please select a product --
										</option>
										{products.map((product: Product) => (
											<option
												key={product.productId}
												value={product.device}
												className='form-option'
											>
												{product.device}
											</option>
										))}
									</select>
								) : (
									<p className='error-danger'>'No product available'</p>
								)}
							</label>
						</div>
						<div className='form-group'>
							<label htmlFor='description'>Issue Description:
								<textarea
									defaultValue={actionData?.fields?.description}
									id='description'
									name='description'
									aria-invalid={Boolean(actionData?.fieldErrors?.description)}
									aria-errormessage={actionData?.fieldErrors?.description
										? 'description-error'
										: undefined}
									className='form-textarea'
								/>
							</label>
							{actionData?.fieldErrors?.description ? (
								<p
									className='error-danger'
									role='alert'
									id='description-error'
								>
									{actionData.fieldErrors.description}
								</p>
							) : null}
						</div>
						<div id='form-error-message'>
							{actionData?.formError ? (
								<p className='error-danger' role='alert'>
									{actionData.formError}
								</p>
							) : null}
							<button type='submit' className='btn form-btn'>
								Send
							</button>
						</div>
					</fetcher.Form>
				</div>
			</main>
		</>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	if (caught.status === 401) {
		return (
			<div className='error-container'>
				<div className='form-container form-content'>
					<p>You must be logged in to create a ticket.</p>
					<Link to='/login?redirectTo=/tickets/new-ticket'>
						<button className='btn form-btn'>Login</button>
					</Link>
				</div>
			</div>
		);
	}
	throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary({ error }: { error: Error; }) {
	console.error(error);
	return (
		<div className='error-container'>
			<div className='form-container form-content'>
				Something unexpected went wrong. Sorry about that.
			</div>
		</div>
	);
}
