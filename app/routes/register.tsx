import type {
	MetaFunction,
	LoaderFunction,
	ActionFunction
} from '@remix-run/node';
import { json } from '@remix-run/node';
import {
	Link,
	useLoaderData,
	useActionData,
	useSearchParams,
	useFetcher
} from '@remix-run/react';

import {
	safeRedirect,
	validateUsername,
	validateEmail,
	validatePassword,
	validateService
} from '~/utils/functions';
import { createUserSession, register } from '~/utils/session.server';
import { FaTools } from 'react-icons/fa';
import { getUserByEmail } from '~/models/users.server';
import { getServices } from '~/models/services.server';
import { prisma } from '~/utils/db.server';

export const meta: MetaFunction = () => {
	return {
		title: 'Support-Desk | Register'
	};
};

type LoaderData = {
	services: Awaited<ReturnType<typeof getServices>>;
};

export const loader: LoaderFunction = async () => {
	const services = await getServices();
	return json<LoaderData>({ services });
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

export const action: ActionFunction = async ({ request }) => {
	const form = await request.formData();

	const username = form.get('username');
	const email = form.get('email');
	const password = form.get('password');
	const service = form.get('service');

	let redirectTo = safeRedirect(form.get('redirectTo') || '/');

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

	const userExists = await prisma.user.findUnique({
		where: { email }
	});

	if (userExists) {
		return badRequest({
			fields,
			formError: `User with email '${email}' already exists`
		});
	}

	const user = await register({
		username,
		email,
		password,
		service
	});

	if (!user || !user.id) {
		return badRequest({
			fields,
			formError: 'Something went wrong trying to create a new user.'
		});
	}

	const isAdmin = await getUserByEmail(email);
	if (isAdmin?.service === process.env.ADMIN_ROLE) {
		redirectTo = '/board/admin';
	} else {
		redirectTo = '/board/employee';
	}

	return createUserSession(user.id, redirectTo);
};

export default function Register() {
	const { services } = useLoaderData() as LoaderData;
	const actionData = useActionData() as ActionData;
	const [searchParams] = useSearchParams();
	const fetcher = useFetcher();

	function handleSelect(selectedValue: string) {
		fetcher.submit(
			{ selected: selectedValue },
			{ method: 'post', action: '/register' }
		);
	}

	return (
		<>
			<header className='container header'>
				<Link to='/login' className='icon-header'>
					<FaTools className='icon-size icon-shadow icon-linked icon-header' />
					Login
				</Link>
				<p>Register to get support!</p>
			</header>
			<div className='form-container-center'>
				<h1>Register</h1>
				<em>
					Already registered?{' '}
					<Link to='/login'>
						<span>Login</span>
					</Link>
				</em>
				<div className='form-content'>
					<fetcher.Form reloadDocument method='post' className='form'>
						<input
							type='hidden'
							name='redirectTo'
							value={searchParams.get('redirectTo') ?? undefined}
						/>
						<div className='form-group'>
							<label htmlFor='username-input'>
								Username
								<input
									type='text'
									id='username-input'
									name='username'
									autoComplete='name'
									defaultValue={actionData?.fields?.username}
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
								<p className='error-danger' role='alert' id='username-error'>
									{actionData.fieldErrors.username}
								</p>
							) : null}
						</div>
						<div className='form-group'>
							<label htmlFor='email-input'>
								Email
								<input
									type='email'
									id='email-input'
									name='email'
									autoComplete='email'
									defaultValue={actionData?.fields?.email}
									aria-invalid={Boolean(actionData?.fieldErrors?.email)}
									aria-errormessage={
										actionData?.fieldErrors?.email ? 'email-error' : undefined
									}
								/>
							</label>
							{actionData?.fieldErrors?.email ? (
								<p className='error-danger' role='alert' id='email-error'>
									{actionData.fieldErrors.email}
								</p>
							) : null}
						</div>
						<div className='form-group'>
							<label htmlFor='password-input'>
								Password
								<input
									type='password'
									id='password-input'
									name='password'
									autoComplete='current-password'
									defaultValue={actionData?.fields?.password}
									aria-invalid={Boolean(actionData?.fieldErrors?.password)}
									aria-errormessage={
										actionData?.fieldErrors?.password
											? 'password-error'
											: undefined
									}
								/>
							</label>
							{actionData?.fieldErrors?.password ? (
								<p className='error-danger' role='alert' id='password-error'>
									{actionData.fieldErrors.password}
								</p>
							) : null}
						</div>
						<div className='form-group'>
							<label htmlFor='service-select'>
								Service
								{services.length ? (
									<select
										name='service'
										id='service-select'
										defaultValue='- Select your service -'
										onSelect={(e) => handleSelect}
										className='form-select'
									>
										<option
											defaultValue='- Select your service -'
											disabled
											className='form-option-disabled'
										>
											- Select your service -
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
								<p className='error-danger' role='alert' id='service-error'>
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
						<button type='submit' className='btn form-btn'>
							Register
						</button>
					</fetcher.Form>
				</div>
			</div>
		</>
	);
}
