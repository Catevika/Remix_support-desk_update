import type { MetaFunction, LoaderFunction, ActionFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
	Form,
	Link,
	useLoaderData,
	useActionData,
	useCatch
} from '@remix-run/react';

import { requireUserId, getUser } from '~/utils/session.server';
import { validateProduct } from '~/utils/functions';
import { prisma } from '~/utils/db.server';

export const meta: MetaFunction = () => {
	return {
		title: 'Support-Desk | Products'
	};
};

type LoaderData = {
	user: Awaited<ReturnType<typeof getUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
	const user = await getUser(request);
	if (!user || user.service !== 'Information Technology') {
		throw new Response('Unauthorized', { status: 401 });
	}
	return json<LoaderData>({ user });
};

type ActionData = {
	formError?: string;
	fieldErrors?: {
		device: string | undefined;
	};
	fields?: {
		device: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
	const userId = await requireUserId(request);

	const form = await request.formData();
	const device = form.get('device');
	if (typeof device !== 'string') {
		return badRequest({
			formError: `Product must be an at least 3 characters long string`
		});
	}

	const fieldErrors = {
		device: validateProduct(device)
	};

	const fields = { device };
	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	const productExists = await prisma.product.findUnique({
		where: { device }
	});

	if (productExists) {
		return badRequest({
			fields,
			formError: `Product '${device}' already exists`
		});
	}

	await prisma.product.create({
		data: { device, authorId: userId }
	});
	return redirect(`/board/admin/products/new-product`);
};

export default function NewProductRoute() {
	const { user } = useLoaderData() as LoaderData;
	const actionData = useActionData() as ActionData;

	return (
		<>
			<main className='form-container form-container-admin'>
				<div className='form-content'>
					<Form reloadDocument method='post' className='form'>
						<p className='list'>
							New Product from&nbsp;
							<span className='capitalize'>{user?.username}</span>
						</p>
						<div className='form-group'>
							<label htmlFor='device'>
								New Product:{' '}
								<input
									type='text'
									defaultValue={actionData?.fields?.device}
									name='device'
									aria-invalid={Boolean(actionData?.fieldErrors?.device)}
									aria-errormessage={
										actionData?.fieldErrors?.device
											? 'product-error'
											: undefined
									}
								/>
							</label>
							{actionData?.fieldErrors?.device ? (
								<p
									className='error-danger'
									role='alert'
									id='name-error'
								>
									{actionData.fieldErrors.device}
								</p>
							) : null}
						</div>
						<div>
							{actionData?.formError ? (
								<p className='error-danger' role='alert'>
									{actionData.formError}
								</p>
							) : null}
							<button
								type='submit'
								name='_action'
								value='create'
								className='btn form-btn'
							>
								Add
							</button>
						</div>
					</Form>
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
					<p>You must be logged in with administrator rights to add a new product.</p>
					<Link to='/login?redirectTo=/products/new-product'>
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
