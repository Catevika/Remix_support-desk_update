import type { MetaFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getUser } from '~/utils/session.server';
import DeleteButton from './DeleteButton';

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
	} else {
		return {
			title: `Suport Desk | Users | ${data?.user?.username}'s profile`
		};
	}
};

export type LoaderData = {
	user: Awaited<ReturnType<typeof getUser>>;
	isOwner: boolean;
	canDelete: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const user = await getUser(request);

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
	return json(data);
};

export default function UserDisplay({
	user,
	isOwner,
	canDelete = true
}: {
	user: Awaited<ReturnType<typeof getUser>>;
	isOwner: boolean;
	canDelete?: boolean;
}) {
	return (
		<>
			{user ? (
				<ul>
					<li className='list'>
						Name:&nbsp;<span>{user.username}</span>
					</li>
					<li className='list'>
						Email:&nbsp;<span>{user.email}</span>
					</li>
					<li className='list separator-bottom'>
						Service:&nbsp;<span>{user.service}</span>
					</li>
					<li className='list'>
						Date Registered:&nbsp;
						<span>{new Date(user.createdAt).toLocaleString()}</span>
					</li>
					<li className='list'>
						Date Updated:&nbsp;
						<span>{new Date(user.updatedAt).toLocaleString()}</span>
					</li>
				</ul>
			) : null}
			{isOwner ? (
				<DeleteButton isOwner={isOwner} canDelete={canDelete} />
			) : null}
		</>
	);
}
