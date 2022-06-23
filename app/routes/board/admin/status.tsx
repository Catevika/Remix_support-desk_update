import { json, LoaderFunction } from '@remix-run/node';
import { Outlet, Form, useLoaderData, Link, NavLink, useCatch } from '@remix-run/react';
import { getStatuses } from '~/models/status.server';
import AdminNavBar from '~/components/AdminNavBar';
import LogoutButton from '~/components/LogoutButton';
import { SiStatuspage } from 'react-icons/si';
import { FaTools } from 'react-icons/fa';

type LoaderData = {
	statuses: Awaited<ReturnType<typeof getStatuses>>;
};

export const loader: LoaderFunction = async () => {
	const statuses = await getStatuses();

	return json<LoaderData>({ statuses });
};


export default function StatusRoute() {
	const { statuses } = useLoaderData() as LoaderData;
	return (
		<>
			<header className='container header'>
				<Link to='/board/admin' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to Board
				</Link>
				<AdminNavBar />
				<LogoutButton />
				<h1>Manage Status List</h1>
			</header>
			<main className='grid-container'>
				{statuses.length ? (
					<>
						<div>
							<SiStatuspage className='icon-size icon-container' />
							<p>Available status:&nbsp;<span>{statuses.length}</span></p>
							<ul>
								{statuses.map((status) => (
									<li key={status.statusId}>
										<NavLink to={status.statusId} prefetch='intent' className={({ isActive }) =>
											isActive ? 'active' : undefined
										}>
											{status.type}
										</NavLink>
									</li>
								))}
							</ul>
						</div>
					</>
				) : "No status available yet."}
				<div>
					<div>
						<Outlet />
					</div>
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
					<p>You must be logged in with administrator rights to create a status.</p>
					<Link to='/login?redirectTo=/board/admin/sratus/new-status'>
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
