import type { LoaderFunction, ActionFunction, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
	Form,
	Link,
	useLoaderData,
	useCatch,
	useParams
} from '@remix-run/react';
import { prisma } from '~/utils/db.server';
import { requireUser } from '~/utils/session.server';
import UserDisplay from '~/components/UserDisplay';
import { FaTools } from 'react-icons/fa';

// TODO: Add edit option - See Post from EGGHEAD.IO

export const meta: MetaFunction = ({
	data
}: {
	data: LoaderData | undefined;
}) => {
	if (!data) {
		return {
			title: 'No user',
			description: 'No user found'
		};
	}
	return {
		title: `${data?.user?.username}`
	};
};

type LoaderData = {
	user: Awaited<ReturnType<typeof requireUser>>;
	isOwner: boolean;
	canDelete: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const user = await requireUser(request);

	if (!user) {
		throw new Response('User Not Found.', {
			status: 404
		});
	}

	const data: LoaderData = {
		user,
		isOwner: user.id === params.userId,
		canDelete: true
	};

	return json<LoaderData>(data);
};

export const action: ActionFunction = async ({ request, params }) => {
	const form = await request.formData();

	if (form.get('_method') !== 'delete') {
		throw new Response(`The _method ${form.get('_method')} is not supported`, {
			status: 400
		});
	}

	await prisma.user.delete({ where: { id: params.userId } });
	return redirect('/');
};

export default function ProductRoute() {
	const data = useLoaderData() as LoaderData;

	return (
		<>
			<header className='container header'>
				<Link to='/board/employee/' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to Board
				</Link>
				<h1>Manage your User Profile</h1>
				<Form action='/logout' method='post'>
					<button type='submit' className='btn'>
						Logout
					</button>
				</Form>
			</header>
			<main className='form-container form-container-center'>
				<div className='form-content'>
					<UserDisplay
						user={data.user}
						isOwner={data.isOwner}
						canDelete={data.isOwner ? data.canDelete : false}
					/>
				</div>
			</main>
		</>
	);
}

export function CatchBoundary() {
	const caught = useCatch();
	const params = useParams();
	switch (caught.status) {
		case 400: {
			return (
				<div className='error-container'>
					<div className='form-container form-content'>
						What you're trying to do is not allowed.
					</div>
				</div>
			);
		}
		case 404: {
			return (
				<div className='error-container'>
					<div className='form-container form-content'>
						{params.userId} does not exist.
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
	return (
		<div className='error-container' style={{ fontSize: '1.5rem' }}>
			<div className='form-container form-content'>
				<p>
					To <span className='error-danger'>Delete your Account</span>, please
					send a{' '}
					<Link to={`/tickets/${userId}`}>
						<span>ticket</span>
					</Link>{' '}
					to your Support Desk.
				</p>
				<Link to={`/users/${userId}`}>
					<button className='btn form-btn'>Back to Profile</button>
				</Link>
			</div>
		</div>
	);
}
