import type {
	MetaFunction,
	LoaderFunction,
	ActionFunction
} from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
	Form,
	Link,
	useLoaderData,
	useActionData,
	useCatch,
	useTransition
} from '@remix-run/react';

import { requireUserId, getUser } from '~/utils/session.server';
import { prisma } from '~/utils/db.server';
import { validateServiceName } from '~/utils/functions';
import { getService, deleteService } from '~/models/services.server';

export const meta: MetaFunction = ({
	data
}: {
	data: LoaderData | undefined;
}) => {
	if (!data) {
		return {
			title: 'No service'
		};
	} else {
		return {
			title: 'Support Desk | Services'
		};
	}
};

type LoaderData = {
	user: Awaited<ReturnType<typeof getUser>>;
	service: Awaited<ReturnType<typeof getService>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const user = await getUser(request);
	if (!user || user.service !== 'Information Technology') {
		throw new Response('Unauthorized', { status: 401 });
	}

	if (params.serviceId === 'new-service') {
		const user = await getUser(request);

		const data: LoaderData = {
			user,
			service: null
		};

		return data;
	} else {
		const service = await getService(params.serviceId);

		const data: LoaderData = {
			user,
			service
		};

		return data;
	}
};

type ActionData = {
	formError?: string;
	fieldErrors?: {
		name: string | undefined;
	};
	fields?: {
		name: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request, params }) => {
	const userId = await requireUserId(request);

	const form = await request.formData();
	const name = form.get('name');

	if (typeof name !== 'string') {
		return badRequest({
			formError: `Service must be an at least 2 characters long string`
		});
	}

	const intent = form.get('intent');

	if (intent === 'delete') {
		await deleteService(params.serviceId);
		return redirect('/board/admin/services/new-service');
	}

	const fieldErrors = {
		name: validateServiceName(name)
	};

	const fields = { name };
	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	const serviceExists = await prisma.service.findUnique({
		where: { name }
	});

	if (serviceExists) {
		return badRequest({
			fields,
			formError: `Service '${name}' already exists`
		});
	}

	if (params.serviceId === 'new-service') {
		await prisma.service.create({
			data: { name, authorId: userId }
		});
	} else {
		await prisma.service.update({
			data: { name },
			where: { serviceId: params.serviceId }
		});
	}

	return redirect('/board/admin/services/new-service');
};

export default function adminServiceRoute() {
	const data = useLoaderData() as LoaderData;
	const user = data.user;

	const actionData = useActionData() as ActionData;
	const transition = useTransition();

	const isNewService = !data.service?.name;
	const isAdding = Boolean(
		transition.submission?.formData.get('intent') === 'create'
	);
	const isUpdating = Boolean(
		transition.submission?.formData.get('intent') === 'update'
	);
	const isDeleting = Boolean(
		transition.submission?.formData.get('intent') === 'delete'
	);

	return (
		<main className='form-scroll-main'>
			<div className='form-scroll'>
				<Form
					reloadDocument
					method='post'
					key={data.service?.serviceId ?? 'new-service'}
				>
					<p>
						{isNewService ? 'New' : null}&nbsp;Service from:
						<span className='capitalize'>&nbsp;{user?.username}&nbsp;</span> -
						Email:<span>&nbsp;{user?.email}</span>
					</p>
					<div className='form-content'>
						<div className='form-group'>
							<label htmlFor='name'>
								{isNewService ? 'New' : null}&nbsp;Service:{' '}
								<input
									type='text'
									defaultValue={data.service?.name}
									name='name'
									aria-invalid={Boolean(actionData?.fieldErrors?.name)}
									aria-errormessage={
										actionData?.fieldErrors?.name ? 'service-error' : undefined
									}
								/>
							</label>
							{actionData?.fieldErrors?.name ? (
								<p className='error-danger' role='alert' id='service-error'>
									{actionData.fieldErrors.name}
								</p>
							) : null}
						</div>
						<div id='form-error-message'>
							{actionData?.formError ? (
								<p className='error-danger' role='alert'>
									{actionData.formError}
								</p>
							) : null}
							{data.service ? (
								<div className='form-group inline'>
									<label>
										Created at:&nbsp;
										<input
											type='text'
											id='createdAt'
											name='createdAt'
											defaultValue={new Date(
												data.service.createdAt
											).toLocaleString('en-us', {
												month: '2-digit',
												day: '2-digit',
												year: '2-digit',
												hour: '2-digit',
												minute: '2-digit',
												hour12: false
											})}
										/>
									</label>
									<label>
										Updated at:&nbsp;
										<input
											type='text'
											id='updatedAt'
											name='updatedAt'
											defaultValue={new Date(
												data.service.updatedAt
											).toLocaleString('en-us', {
												month: '2-digit',
												day: '2-digit',
												year: '2-digit',
												hour: '2-digit',
												minute: '2-digit',
												hour12: false
											})}
										/>
									</label>
								</div>
							) : null}
						</div>
						<div className='inline'>
							<button
								type='submit'
								name='intent'
								value={isNewService ? 'create' : 'update'}
								className='btn form-btn'
								disabled={isAdding || isUpdating}
							>
								{isNewService ? (isAdding ? 'Adding...' : 'Add') : null}
								{isNewService ? null : isUpdating ? 'Updating...' : 'Update'}
							</button>
							{isNewService ? null : (
								<Link to='/board/admin/services/new-service'>
									<button className='btn form-btn'>Back to New Service</button>
								</Link>
							)}
							{isNewService ? null : (
								<button
									type='submit'
									name='intent'
									value='delete'
									className='btn form-btn btn-danger'
									disabled={isDeleting}
								>
									{isDeleting ? 'isDeleting...' : 'Delete'}
								</button>
							)}
						</div>
					</div>
				</Form>
			</div>
		</main>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	if (caught.status === 401) {
		return (
			<div className='error-container'>
				<div className='form-container form-content'>
					<p>
						You must be logged in with administrator rights to add a new
						service.
					</p>
					<Link to='/login?redirectTo=/board/admin/services/new-service'>
						<button className='btn form-btn'>Login</button>
					</Link>
				</div>
			</div>
		);
	}
	throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary({ error }: { error: Error }) {
	console.error(error);
	return (
		<div className='error-container'>
			<div className='form-container form-container-message form-content'>
				Something unexpected went wrong. Sorry about that.
			</div>
		</div>
	);
}
