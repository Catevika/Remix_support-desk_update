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
import { validateStatus } from '~/utils/functions';
import { getStatus, deleteStatus } from '~/models/status.server';

export const meta: MetaFunction = ({
	data
}: {
	data: LoaderData | undefined;
}) => {
	if (!data) {
		return {
			title: 'No Status'
		};
	} else {
		return {
			title: 'Support Desk | Status'
		};
	}
};

type LoaderData = {
	user: Awaited<ReturnType<typeof getUser>>;
	status: Awaited<ReturnType<typeof getStatus>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const user = await getUser(request);
	if (!user || user.service !== 'Information Technology') {
		throw new Response('Unauthorized', { status: 401 });
	}

	if (params.statusId === 'new-status') {
		const user = await getUser(request);

		const data: LoaderData = {
			user,
			status: null
		};

		return data;
	} else {
		const status = await getStatus(params.statusId);

		const data: LoaderData = {
			user,
			status
		};

		return data;
	}
};

type ActionData = {
	formError?: string;
	fieldErrors?: {
		type: string | undefined;
	};
	fields?: {
		type: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request, params }) => {
	const userId = await requireUserId(request);

	const form = await request.formData();
	const type = form.get('type');

	if (typeof type !== 'string') {
		return badRequest({
			formError: 'Type must be an at least 3 characters long string'
		});
	}

	const intent = form.get('intent');

	if (intent === 'delete') {
		await deleteStatus(params.statusId);
		return redirect('/board/admin/status/new-status');
	}

	const fieldErrors = {
		type: validateStatus(type)
	};

	const fields = { type };

	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	const typeExists = await prisma.status.findUnique({
		where: { type }
	});

	if (typeExists) {
		return badRequest({
			fields,
			formError: `Status '${type}' already exists`
		});
	}

	if (params.statusId === 'new-status') {
		await prisma.status.create({
			data: { type, technicianId: userId }
		});
	} else {
		await prisma.status.update({
			data: { type },
			where: { statusId: params.statusId }
		});
	}
	return redirect('/board/admin/status/new-status');
};

export default function adminStatusRoute() {
	const data = useLoaderData() as LoaderData;
	const user = data.user;

	const actionData = useActionData() as ActionData;
	const transition = useTransition();

	const isNewStatus = !data.status?.type;
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
					key={data.status?.statusId ?? 'new-status'}
				>
					<p>
						{isNewStatus ? 'New' : null}&nbsp;Status from:
						<span className='capitalize'>&nbsp;{user?.username}&nbsp;</span> -
						Email:<span>&nbsp;{user?.email}</span>
					</p>
					<div className='form-content'>
						<div className='form-group'>
							<label htmlFor='type'>
								{isNewStatus ? 'New' : null}&nbsp;Status:{' '}
								<input
									type='text'
									defaultValue={data.status?.type}
									name='type'
									aria-invalid={Boolean(actionData?.fieldErrors?.type)}
									aria-errormessage={
										actionData?.fieldErrors?.type ? 'status-error' : undefined
									}
								/>
							</label>
							{actionData?.fieldErrors?.type ? (
								<p className='error-danger' role='alert' id='status-error'>
									{actionData.fieldErrors.type}
								</p>
							) : null}
						</div>
						<div>
							{actionData?.formError ? (
								<p className='error-danger' role='alert'>
									{actionData.formError}
								</p>
							) : null}
							{data.status ? (
								<div className='form-group inline'>
									<label>
										Created at:&nbsp;
										<input
											type='text'
											id='createdAt'
											name='createdAt'
											defaultValue={new Date(
												data.status.createdAt
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
												data.status.updatedAt
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
								value={isNewStatus ? 'create' : 'update'}
								className='btn form-btn'
								disabled={isAdding || isUpdating}
							>
								{isNewStatus ? (isAdding ? 'Adding...' : 'Add') : null}
								{isNewStatus ? null : isUpdating ? 'Updating...' : 'Update'}
							</button>
							{isNewStatus ? null : (
								<Link to='/board/admin/status/new-status'>
									<button className='btn form-btn'>Back to New Status</button>
								</Link>
							)}
							{isNewStatus ? null : (
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
						You must be logged in with administrator rights to create a status.
					</p>
					<Link to='/login?redirectTo=/board/admin/status/new-status'>
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
