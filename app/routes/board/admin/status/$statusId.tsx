import type { LoaderFunction, ActionFunction, MetaFunction } from '@remix-run/node';
import {
	json,
	redirect
} from '@remix-run/node';
import {
	Link,
	useLoaderData,
	useCatch,
	useParams
} from '@remix-run/react';
import { prisma } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';
import DeleteButton from '~/components/DeleteButton';

export const meta: MetaFunction = ({
	data
}: {
	data: LoaderData | undefined;
}) => {
	if (!data) {
		return {
			title: 'No status',
			description: 'No status found'
		};
	}
	return {
		title: `Support-Desk | Status | ${data.type}`,
		description: `Here ist the "${data.type}" created by ${data?.username}`
	};
};

type LoaderData = {
	id: string;
	username: string;
	type: string;
	isOwner: boolean;
	canDelete: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
	const userId = await getUserId(request);
	const status = await prisma.status.findUnique({
		where: { statusId: params.statusId }
	});

	const users = await prisma.user.findMany({
		select: { id: true, username: true }
	});

	const user = users.filter((user) => user.id === status?.technicianId)[0];

	const { id, username } = user;

	if (!username || !id) {
		throw new Response('User Not Found.', {
			status: 404
		});
	}

	if (!status) {
		throw new Response('Status Not Found.', {
			status: 404
		});
	}

	if (!user) {
		throw new Response('User Not Found.', {
			status: 404
		});
	}

	const data: LoaderData = {
		id,
		username,
		type: status.type,
		isOwner: userId === status.technicianId,
		canDelete: true
	};
	return json(data);
};

export const action: ActionFunction = async ({ request, params }) => {
	const form = await request.formData();
	if (form.get('_method') !== 'delete') {
		throw new Response(`The _method ${form.get('_method')} is not supported`, {
			status: 400
		});
	}
	const userId = await requireUserId(request);
	const status = await prisma.status.findUnique({
		where: { statusId: params.statusId }
	});

	if (!status) {
		throw new Response("Can't delete what does not exist", {
			status: 404
		});
	}

	if (status.technicianId !== userId) {
		throw new Response("Can't delete a status that is not yours", {
			status: 401
		});
	}
	await prisma.status.delete({ where: { statusId: params.statusId } });
	return redirect('/board/admin/status/new-status');
};

export default function StatusRoute() {
	const data = useLoaderData() as LoaderData;

	return (
		<>
			<main className='form-container'>
				<p>
					{data?.username && (
						<>
							Status created by{' '}
							<span className='capitalize'>{data.username}</span>
						</>
					)}
				</p>
				<div className='form-content'>
					<p>{data.type}</p>
					<DeleteButton isOwner={data.isOwner} canDelete={data.isOwner ? data.canDelete : false} />
				</div>
				<Link to='/board/admin/status/new-status'>
					<button className='btn form-btn'>Back to Create Status</button>
				</Link>
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
						{params.statusId} does not exist.
					</div>
				</div>
			);
		}
		case 401: {
			return (
				<div className='error-container'>
					<div className='form-container form-content'>
						Sorry, but {params.statusId} is not your status.
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
	const { statusId } = useParams();
	return (
		<div className='error-container'>
			<div className='form-container form-content'>
				There was an error loading the status by the id:{' '}
				<p>
					{' '}
					<span>{`${statusId}.`}</span>
				</p>
				<p>Sorry.</p>
			</div>
		</div>
	);
}
