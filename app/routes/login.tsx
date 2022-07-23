import type { ActionFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
	useActionData,
	useSearchParams,
	Form,
	useTransition,
	Link
} from '@remix-run/react';

import { safeRedirect, validateEmail, validatePassword } from '~/utils/functions';
import { createUserSession, login } from '~/utils/session.server';
import { FaTools } from 'react-icons/fa';

import { getUserByEmail } from '~/models/users.server';

export const meta: MetaFunction = () => {
	return {
		title: 'Support-Desk | Login'
	};
};

type ActionData = {
	formError?: string;
	fieldErrors?: {
		email: string | undefined;
		password: string | undefined;
	};
	fields?: {
		email: string;
		password: string;
	};
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
	const formData = await request.formData();
	const email = formData.get('email');
	const password = formData.get('password');
	let redirectTo = formData.get('redirectTo');

	if (!email && !password) {
		return null;
	} else if (
		typeof email !== 'string' ||
		typeof password !== 'string' ||
		typeof redirectTo !== 'string'
	) {
		return badRequest({ formError: 'Form not submitted correctly.' });
	}

	const isAdmin = email !== null && await getUserByEmail(email);
	(isAdmin && isAdmin.service === process.env.ADMIN_ROLE)
	?	(redirectTo ? safeRedirect(redirectTo)	: redirectTo = safeRedirect('/board/admin'))
	: (redirectTo ? safeRedirect(redirectTo) : redirectTo = safeRedirect('/board/employee'))

	const fields = { email, password };
	const fieldErrors = {
		email: validateEmail(email),
		password: validatePassword(password)
	};
	if (Object.values(fieldErrors).some(Boolean)) {
		return badRequest({ fieldErrors, fields });
	}

	const user = await login({ email, password });
	if (!user) {
		return badRequest({
			fields,
			formError: 'Email / password combination not valid or need to register first'
		});
	}

	return createUserSession(user.id, redirectTo);
};

export default function Login() {
	const actionData = useActionData() as ActionData;
	const [searchParams] = useSearchParams();
	const transition = useTransition();
	return (
		<>
			<header className='container header'>
				<Link to='/register' className='icon-header'>
					<FaTools className='icon-size icon-shadow icon-linked icon-header' />Register
				</Link>
				<p>Login to the Support-Desk!</p>
			</header>
			<main className='form-container-center'>
				<h1>Login</h1>
				<em>Not registered yet? <Link to='/register'><span>Register</span></Link></em>
				<div className='form-content'>
					<Form method='post' className='form'>
						<input
							type='hidden'
							name='redirectTo'
							value={searchParams.get('redirectTo') ?? undefined}
						/>
						<div className='form-group'>
							<label htmlFor='email-input'>Email</label>
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
								autoFocus
							/>
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
							<label htmlFor='password-input'>Password</label>
							<input
								id='password-input'
								name='password'
								autoComplete='current-password'
								defaultValue={actionData?.fields?.password}
								type='password'
								aria-invalid={Boolean(actionData?.fieldErrors?.password)}
								aria-errormessage={
									actionData?.fieldErrors?.password
										? 'password-error'
										: undefined
								}
							/>
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
						<div id='form-error-message'>
							{actionData?.formError ? (
								<p className='error-danger' role='alert'>
									{actionData.formError}
								</p>
							) : null}
						</div>
						<button type='submit' className='btn form-btn btn-center'>
						{transition.submission ? 'Logging in...' : 'Log in'}
						</button>
					</Form>
				</div>
			</main>
		</>
	);
}
