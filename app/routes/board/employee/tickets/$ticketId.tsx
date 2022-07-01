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
import { validateTitle, validateDescription } from '~/utils/functions';
import { getTicket, deleteTicket } from '~/models/tickets.server';

export const meta: MetaFunction = ({
	data
}: {
	data: LoaderData | undefined;
}) => {
	if (!data) {
		return {
			title: 'No ticket'
		};
	} else {
		return {
			title: 'Support Desk | Tickets'
		};
	}
};

type LoaderData = {
	user: Awaited<ReturnType<typeof getUser>>;
	statuses: Awaited<ReturnType<typeof getStatuses>>;
	products: Awaited<ReturnType<typeof getProducts>>;
	ticket: Awaited<ReturnType<typeof getTicket>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
	if (params.ticketId === 'new-ticket') {
		const [user, statuses, products] = await Promise.all([
			getUser(request),
			getStatuses(),
			getProducts()
		]);

		const data: LoaderData = {
			user,
			statuses,
			products,
			ticket: null
		};

	
		return data;
	} else {
		const [user, statuses, products, ticket] = await Promise.all([
			getUser(request),
			getStatuses(),
			getProducts(),
			getTicket(params.ticketId)
		]);
	
		const data: LoaderData = {
			user,
			products,
			statuses,
			ticket
		};
	
		return data;
	}
	}

type ActionData = {
	formError?: string;
	fieldErrors?: {
		title: string | undefined;
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

export const action: ActionFunction = async ({ request, params }) => {
	const form = await request.formData();

	const title = form.get('title');
	const status = form.get('status');
	const product = form.get('product');
	const description = form.get('description');
	const intent = form.get('intent');

	if(intent === 'delete') {
		await deleteTicket(params.ticketId)
		return redirect('/board/employee/tickets');
	}	

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

	if (params.ticketId === 'new-ticket') {
		await prisma.ticket.create({
			data: {
				authorId: userId,
				ticketProductId,
				ticketStatusId,
				title,
				description
			}
		});
	} else {
		await prisma.ticket.update({
			data: {
				authorId: userId,
				ticketProductId,
				ticketStatusId,
				title,
				description
			},
			where: { ticketId: params.ticketId }
			}
		);
	}
	
	return redirect('/board/employee/tickets/new-ticket');
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

	const isNewTicket = !data.ticket ;
	const isCreating = Boolean(fetcher.submission?.formData.get('intent') === 'create');
	const isUpdating = Boolean(fetcher.submission?.formData.get('intent') === 'update');
	const isDeleting = Boolean(fetcher.submission?.formData.get('intent') === 'delete');
	
	return (
		<>
			<main className='form-container'>
				<fetcher.Form reloadDocument method='post' className='form' key={data.ticket?.ticketId ?? 'new-ticket'}>
					<p>
						{isNewTicket ? 'New' : null }&nbsp;Ticket from:<span className='capitalize'>&nbsp;{user?.username}&nbsp;</span> - Email:<span>&nbsp;{user?.email}</span>
					</p>
					<div className='form-content'>
						<div className='form-group'>
							<label htmlFor="title">
								Title:{''}
								<input
									type='text'
									id='title'
									name='title'
									defaultValue={data.ticket?.title}
									aria-invalid={Boolean(actionData?.fieldErrors?.title)}
									aria-errormessage={actionData?.fieldErrors?.title ? 'title-error' : undefined}
									autoFocus
								/>
							{actionData?.fieldErrors?.title ? (
								<p
								className='error-danger'
								role='alert'
								id='title-error'
								>
									{actionData.fieldErrors.title}
								</p>
							) : null}
							</label>
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
							{data.ticket ? <p><em>Old status: {`${data.ticket.ticketStatus?.type}`}</em></p> : null}
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
											defaultValue={'-- Please select a product --'}
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
							{data.ticket ? <p><em>Old product: {`${data.ticket.ticketProduct?.device}`}</em></p> : null}
						</div>
						<div className='form-group'>
							<label htmlFor='description'>Issue Description:
								<textarea
									defaultValue={data.ticket?.description}
									id='description'
									name='description'
									aria-invalid={Boolean(actionData?.fieldErrors?.description)}
									aria-errormessage={actionData?.fieldErrors?.description
										? 'description-error'
										: undefined}
									className='form-textarea'
								/>
							</label>
						</div>
						{actionData?.fieldErrors?.description ? (
							<p
								className='error-danger'
								role='alert'
								id='description-error'
							>
								{actionData.fieldErrors.description}
							</p>
						) : null}
						{actionData?.formError ? (
							<p className='error-danger' role='alert'>
								{actionData.formError}
							</p>
						) : null}
						{data.ticket ? (
							<>
								<div className='form-group inline'>
									<label>Created at:&nbsp;
										<input
											type='text'
											id='createdAt'
											name='createdAt'
											defaultValue={new Date(data.ticket.createdAt).toLocaleString('en-us')}
											disabled
										/>
									</label>
									<label>Updated at:&nbsp;
										<input
											type='text'
											id='updatedAt'
											name='updatedAt'
											defaultValue={new Date(data.ticket.updatedAt).toLocaleString('en-us')}
											disabled
										/>
									</label>
								</div>
							</>) : null
						}
						<div className='inline'>
							<button
								type='submit'
								name='intent'
								value={data.ticket ? 'update' : 'create'} className='btn form-btn'
								disabled={isCreating || isUpdating}
							>
							{isNewTicket ? (isCreating ? 'Sending...' : 'Send') : null}
							{isNewTicket ? null : (isUpdating ? 'Updating...' : 'Update')}
							</button>
							{isNewTicket ? null : <Link to='/board/employee/tickets/new-ticket'>
								<button className='btn form-btn'>Back to New Ticket</button>
							</Link>}
							{ isNewTicket ? null : <button type='submit' name='intent' value='delete' className='btn form-btn btn-danger' disabled={isDeleting}>
							{isDeleting ? 'isDeleting...' : 'Delete'}
							</button>}
						</div>
					</div>
				</fetcher.Form>
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
					<Link to='/login?redirectTo=/board/employee/tickets/new-ticket'>
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
