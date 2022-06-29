import { LoaderFunction, ActionFunction, MetaFunction, redirect } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
	Form,
	Link,
	useLoaderData,
	useCatch,
	useParams,
} from '@remix-run/react';
import { User } from "@prisma/client";
import {deleteUserById} from '~/utils/session.server'
import { getUserById } from '~/models/user.server';
import { FaTools } from 'react-icons/fa';

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
	user: User;
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

	return json<LoaderData>({user});
};

export const action: ActionFunction = async ({ request, params }) => {
	const formData = await request.formData();
	const userId = params.userId;
	if(!userId) {
		throw new Response('User Not Found.', {
			status: 404
		});
	}

	if (formData.get('intent') !== ('update') && formData.get('intent') !== ('delete')) {
		throw new Response(`The intent ${formData.get('intent')} is not supported`, {
			status: 403
		});
	}

	if (formData.get('intent') === ('update')) {
		throw new Response(`The intent ${formData.get('intent')} requires administrator rights`, {
			status: 401
		});
	}

	if (formData.get('intent') === ('delete')) {
		await deleteUserById(request, userId)
		return redirect('/');
	}
};

export default function ProductRoute() {
	const {user} = useLoaderData() as LoaderData;

	return (
		<>
			<header className='container header'>
				<Link to='/board/employee/' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to Board
				</Link>
				<h1>User Profile</h1>
				<Form action='/logout' method='post'>
					<button type='submit' className='btn'>
						Logout
					</button>
				</Form>
			</header>
			{user ? (
			<main className='form-container form-container-center form-container-user'>
				<p>User Profile</p>
				<div className='form-content'>
					<div className='form-group'>
						<label htmlFor='userid-input'>User Id:&nbsp;
							<span>
								<input
									type='text'
									id='userid-input'
									name='userid'
									defaultValue={user.id}
									disabled
								/>
							</span>
						</label>
					</div>
					<div className='form-group'>
						<label htmlFor='username-input'>Name:&nbsp;
							<span>
								<input
									type='text'
									id='username-input'
									name='username'
									defaultValue={user.username}
									disabled
								/>
							</span>
						</label>
					</div>
					<div className='form-group'>
					<label htmlFor='email-input'>Email:&nbsp;<span>
						<input
							type='email'
							id='email-input'
							name='email'
							defaultValue={user.email}
							disabled
						/>
						</span>
					</label>
					</div>
					<div className='form-group'>
						<label htmlFor='service-input'>Service:&nbsp;<span>
							<input
								type='service'
								id='service-input'
								name='service'
								defaultValue={user.service}
								disabled
							/>
							</span>
						</label>
					</div>
					<div className='form-group inline'>
						<label>Created at:&nbsp;
							<input
								type='text'
								id='createdAt'
								name='createdAt'
								defaultValue={new Date(user.createdAt).toLocaleString()}
							/>
						</label>
						<label>Updated at:&nbsp;
							<input
								type='text'
								id='updatedAt'
								name='updatedAt'
								defaultValue={new Date(user.updatedAt).toLocaleString()}
							/>
						</label>
					</div>	
					<div className='inline'>
						<Form method='post' className='form'>
							<button type='submit' name='intent' value='update' className='btn form-btn btn-danger'>
								Update
							</button>				
						</Form>
						<Link to='/board/employee/'>
							<button className='btn form-btn'>Back to Board</button>
						</Link>
						<Form method='post' className='form'>
							<button type='submit' name='intent' value='delete' className='btn form-btn btn-danger'>
								Delete
							</button>
						</Form>
					</div>
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
						<Link to={`/board/employee/users/${userId}`}>
							<button className='btn form-btn'>Back to Profile</button>
						</Link>
					</div>
			</div>
			)
		}		
		case 401: {
			return (
			<div className='error-container' style={{ fontSize: '1.5rem' }}>
			<div className='form-container form-container-message form-content'>
				<p>
					To <span className='error-danger error-danger-big'>update your Account</span>, please
					send a{' '}
					<Link to={`/board/employee/tickets/${userId}`}>
						<span>Ticket</span>
					</Link>{' '}
					to the Support Desk.
				</p>
				<Link to={`/board/employee/users/${userId}`}>
					<button className='btn form-btn'>Back to Profile</button>
				</Link>
			</div>
			</div>
			);
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
					To <span className='error-danger error-danger-big'>update your Account</span>, please
					send a{' '}
					<Link to={`/board/employee/tickets/${userId}`}>
						<span>Ticket</span>
					</Link>{' '}
					to the Support Desk.
				</p>
				<Link to={`/board/employee/users/${userId}`}>
					<button className='btn form-btn'>Back to Profile</button>
				</Link>
			</div>
		</div>
	);
}
