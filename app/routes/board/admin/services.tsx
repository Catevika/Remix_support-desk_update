import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, useLoaderData, Link, NavLink, useCatch, Outlet } from '@remix-run/react';
import { getServices } from '~/models/services.server';
import { MdAutoAwesome } from 'react-icons/md';
import { FaTools } from 'react-icons/fa';
import { IconContext } from 'react-icons/lib';
import AdminNavBar from '~/components/AdminNavBar';

type LoaderData = {
	services: Awaited<ReturnType<typeof getServices>>;
};

export const loader: LoaderFunction = async () => {
	const services = await getServices();

	return json<LoaderData>({ services });
};

// TODO: Add a pagination to service list
// TODO: Add a search field to service list

export default function ServicesRoute() {
	const { services } = useLoaderData() as LoaderData;
	return (
		<>
			<header className='container header'>
				<Link to='/board/admin' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to Board
				</Link>
				<AdminNavBar />
				<Form action='/logout' method='post'>
					<button type='submit' className='btn'>
						Logout
					</button>
				</Form>
				<h1>Manage Service List</h1>
			</header>
			<main className='grid-container'>
				{services.length ? (
					<>
						<div>
							<IconContext.Provider
								value={{ color: '#a9a5c0' }}
							><MdAutoAwesome className='icon-size icon-container' /></IconContext.Provider>
							<p>Available services:&nbsp;<span>{services.length}</span></p>
							<ul>
								{services.map((service) => (
									<li key={service.serviceId}>
										<NavLink to={service.serviceId} prefetch='intent' className={({ isActive }) =>
											isActive ? 'active' : undefined
										}>
											{service.name}
										</NavLink>
										<Form method='post'></Form>
									</li>
								))}
							</ul>
						</div>
					</>
				) : "No service available yet."}
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
					<p>You must be logged in with administrator rights to add a new service.</p>
					<Link to='/login?redirectTo=/board/admin/services/new-service'>
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
