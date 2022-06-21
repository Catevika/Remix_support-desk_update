import type {
	MetaFunction,
	LoaderFunction,
	ActionFunction
} from '@remix-run/node';
import {
	json,
	redirect
} from '@remix-run/node';
import { Form, Link, useLoaderData, useActionData, useCatch } from '@remix-run/react';

import { requireUserId, getUser } from '~/utils/session.server';
import { prisma } from '~/utils/db.server';
import { validateRole } from '~/utils/functions';

export const meta: MetaFunction = () => {
	return {
		title: 'Support-Desk | Roles',
		description: 'Create a new role!'
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
		roleType: string | undefined;
	};
	fields?: {
		roleType: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
	const userId = await requireUserId(request);

	const form = await request.formData();
	const roleType = form.get('roleType');
	if (typeof roleType !== 'string') {
		return badRequest({
			formError: `Role must be an at least 3 characters long string`
		});
	}

	const fieldErrors = {
		roleType: validateRole(roleType)
	};

	const fields = { roleType };
	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	const roleExists = await prisma.role.findUnique({
		where: { roleType }
	});

	if (roleExists) {
		return badRequest({
			fields,
			formError: `Role '${roleType}' already exists`
		});
	}

	await prisma.role.create({
		data: { roleType, authorId: userId }
	});
	return redirect(`/board/admin/roles/new-role`);
};

export default function NewRoleRoute() {
	const { user } = useLoaderData() as LoaderData;
	const actionData = useActionData() as ActionData;

	return (
		<>
			<main className='form-container form-container-admin'>
				<div className='form-content'>
					<Form reloadDocument method='post' className='form'>
						<p className='list'>
							New Role from&nbsp;
							<span className='capitalize'>{user?.username}</span>
						</p>
						<div className='form-group'>
							<label htmlFor='roleType'>
								New Role:{' '}
								<input
									type='text'
									defaultValue={actionData?.fields?.roleType}
									name='roleType'
									aria-invalid={Boolean(actionData?.fieldErrors?.roleType)}
									aria-errormessage={
										actionData?.fieldErrors?.roleType ? 'role-error' : undefined
									}
								/>
							</label>
							{actionData?.fieldErrors?.roleType ? (
								<p
									className='error-danger'
									role='alert'
									id='name-error'
								>
									{actionData.fieldErrors.roleType}
								</p>
							) : null}
						</div>
						<div>
							{actionData?.formError ? (
								<p className='error-danger' role='alert'>
									{actionData.formError}
								</p>
							) : null}
							<button type='submit' className='btn form-btn'>
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
					<p>You must be logged in with administrator rights to create a role.</p>
					<Link to='/login?redirectTo=/roles/new-role'>
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
