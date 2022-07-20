import { LoaderFunction, ActionFunction, MetaFunction, redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
	Form,
	Link,
	useLoaderData,
	useCatch,
	useParams,
	useActionData,
	useSearchParams,
	useFetcher,
} from '@remix-run/react';
import {createUserSession, deleteUserById, updateUser} from '~/utils/session.server'
import { getUserById } from '~/models/users.server';
import { FaTools } from 'react-icons/fa';
import { getServices } from '~/models/services.server';
import { safeRedirect, validateEmail, validatePassword, validateService, validateUsername } from '~/utils/functions';
import LogoutButton from '~/components/LogoutButton';

export const meta: MetaFunction = ({
	data
}: {
	data: LoaderData | undefined;
}) => {
	if (!data) {
		return {
			title: 'No user'
		};
	}
	return {
		title: 'Support Desk | User'
	};
};

type LoaderData = {
	user: Awaited<ReturnType<typeof getUserById>>;
	services: Awaited<ReturnType<typeof getServices>>;
};

export const loader: LoaderFunction = async ({ params }) => {
	const userId = params.userId;

	if (!userId) {
		throw new Response('User Not Found.', {
			status: 404
		});
	}
	
	const user = await getUserById(userId);

	if (!user) {
		throw new Response('User Not Found.', {
			status: 404
		});
	}

	const services = await getServices();

	return json<LoaderData>({user, services});
};

type ActionData = {
	formError?: string;
	fieldErrors?: {
		username: string | undefined;
		email: string | undefined;
		password: string | undefined;
		service: string | undefined;
	};
	fields?: {
		username: string;
		email: string;
		password: string;
		service: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });


export const action: ActionFunction = async ({ request, params }) => {
	const form = await request.formData();
	if(!params || !params.userId) {
		return null;
	}
	const user = await getUserById(params.userId);

	const username = form.get('username');
	const email = form.get('email');
	const password = form.get('password');
	const service = form.get('service');

	let redirectTo = safeRedirect(form.get('redirectTo') || `/board/admin/users/userlist`);

	if (!username && !email && !password && !service) {
		return null;
	}

	if (
		typeof username !== 'string' ||
		typeof email !== 'string' ||
		typeof password !== 'string' ||
		typeof service !== 'string' ||
		typeof redirectTo !== 'string'
	) {
		return badRequest({ formError: 'Form not submitted correctly.' });
	}

	const fieldErrors = {
		username: validateUsername(username),
		email: validateEmail(email),
		password: validatePassword(password),
		service: validateService(service)
	};

	const fields = { username, email, password, service };

	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	const userId = params.userId;
	if(!userId) {
		throw new Response('User Not Found.', {
			status: 404
		});
	}

	if (form.get('intent') !== ('update') && form.get('intent') !== ('delete')) {
		throw new Response(`The intent ${form.get('intent')} is not supported`, {
			status: 403
		});
	}

	if (form.get('intent') === ('update')) {
		await updateUser({id: userId, username, email, password, service});
		return createUserSession(userId, redirectTo);
	}

	if (form.get('intent') === ('delete')) {
		await deleteUserById(request, userId)
		return redirect('/');
	}
};

export default function adminUserIdRoute() {
	const {user, services} = useLoaderData() as LoaderData;
	const actionData = useActionData() as ActionData;
	const [searchParams] = useSearchParams();
	const fetcher = useFetcher();

	function handleSelect(selectedValue: string) {
		fetcher.submit(
			{ selected: selectedValue },
			{ method: 'post', action: '/update' }
		);
	}

	const isUpdating = Boolean(fetcher.submission?.formData.get('intent') === 'update');
	const isDeleting = Boolean(fetcher.submission?.formData.get('intent') === 'delete');

	return (
		<>
			<header className='container header'>
				<Link to='/board/admin/users/userlist' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to User List
				</Link>
				<div className='header-flex'>
					<h1>User Profile</h1>
					<LogoutButton />
				</div>
			</header>
			{user ? (
			<main className='form-container form-container-center form-container-user'>
				<p>User Profile</p>
				<div className='form-content'>
					<fetcher.Form reloadDocument method='post' className='form' key={user?.id}>
						<input
							type='hidden'
							name='redirectTo'
							value={searchParams.get('redirectTo') ?? undefined}
						/>
						<div className='form-group'>
							<label htmlFor='username-input'>Username
								<input
									type='text'
									id='username-input'
									name='username'
									autoComplete='name'
									defaultValue={user.username}
									aria-invalid={Boolean(actionData?.fieldErrors?.username)}
									aria-errormessage={
										actionData?.fieldErrors?.username
											? 'username-error'
											: undefined
									}
									autoFocus
								/>
							</label>
							{actionData?.fieldErrors?.username ? (
								<p
									className='error-danger'
									role='alert'
									id='username-error'
								>
									{actionData.fieldErrors.username}
								</p>
							) : null}
						</div>
						<div className='form-group'>
							<label htmlFor='email-input'>Email
								<input
									type='email'
									id='email-input'
									name='email'
									autoComplete='email'
									defaultValue={user.email}
									aria-invalid={Boolean(actionData?.fieldErrors?.email)}
									aria-errormessage={
										actionData?.fieldErrors?.email ? 'email-error' : undefined
									}
								/>
							</label>
							{actionData?.fieldErrors?.email ? (
								<p
									className='error-danger'
									role='alert'
									id='email-error'
								>
									{actionData.fieldErrors.email}
								</p>
							) : null}
						</div>
						<div className='form-group'>
							<label htmlFor='password-input'>Password
								<input
									type='password'
									id='password-input'
									name='password'
									defaultValue={''}
									autoComplete='new-password'
									aria-invalid={Boolean(actionData?.fieldErrors?.password)}
									aria-errormessage={
										actionData?.fieldErrors?.password
											? 'password-error'
											: undefined
									}
								/>
							</label>
							{actionData?.fieldErrors?.password ? (
								<p
									className='error-danger'
									role='alert'
									id='password-error'
								>
									{actionData.fieldErrors.password}
								</p>
							) : null}
						</div>
						<div className='form-group'>
							<label htmlFor='service-select'>Service
								{services.length ? (
									<select
										name='service'
										id='service-select'
										defaultValue={user.service}
										onSelect={(e) => handleSelect}
										className='form-select'
									>
										<option
											defaultValue='-- Please select your service --'
											disabled
											className='form-option-disabled'
										>
											-- Please select your service --
										</option>
										{services.map((service) => (
											<option
												key={service.serviceId}
												value={service.name}
												className='form-option'
											>
												{service.name}
											</option>
										))}
									</select>
								) : (
									'No service available'
								)}
							</label>
							{actionData?.fieldErrors?.service ? (
								<p
									className='error-danger'
									role='alert'
									id='service-error'
								>
									{actionData.fieldErrors.service}
								</p>
							) : null}
						</div>
						<div id='form-error-message'>
							{actionData?.formError ? (
								<p className='error-danger' role='alert'>
									{actionData.formError}
								</p>
							) : null}
						</div>
						<div className='inline'>
							<button
								type='submit'
								name='intent'
								value='update' className='btn'
								disabled={isUpdating}
							>
							{isUpdating ? 'Updating...' : 'Update'}
							</button>
							<Link to='/board/admin/users/userlist'>
								<button className='btn'>Back to User List</button>
							</Link>
							<button type='submit' name='intent' value='delete' className='btn  btn-danger' disabled={isDeleting}>
							{isDeleting ? 'isDeleting...' : 'Delete'}
							</button>
						</div>
					</fetcher.Form>
				</div>
			</main>
			) : null}
		</>
	);
}

export function CatchBoundary() {
	const caught = useCatch();
	const {userId} = useParams();
	switch (caught.status) {
		case 403: {
			return (
				<div className='error-container' style={{ fontSize: '1.5rem' }}>
					<div className='form-container form-container-message form-content'>
						<p>This action is not supported</p>
						<Link to={`/board/admin/users/userlist/${userId}`}>
							<button className='btn form-btn'>Back to Profile</button>
						</Link>
					</div>
			</div>
			)
		}		
		
		case 404: {
			return (
				<div className='error-container'>
					<div className='form-container form-content'>
						{userId} does not exist.
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
	const { userId } = useParams();
	console.log(error);
	return (
		<div className='error-container' style={{ fontSize: '1.5rem' }}>
			<div className='form-container form-container-message form-content'>
				<p>
					To <span className='error-danger error-danger-big'>delete an Account:</span>
				</p>
				<p>
					first delete its tickets and their associated notes,
				</p>
				<p>
					then come back to the user profile
				</p>
				<p>and click the delete button.</p>
				<p>
					OR		
				</p>	
				<p>	
					delete the user via the database.
				</p>
				<p>
					<span className='error-danger error-danger-big'>
						These actions are permanent.
					</span>
				</p>
				<Link to='/board/admin/users/userlist'>
					<button className='btn form-btn'>Back to User List</button>
				</Link>
			</div>
		</div>
	);
}
