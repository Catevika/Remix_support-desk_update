import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link, NavLink, Outlet } from '@remix-run/react';
import { getServices } from '~/models/services.server';
import AdminNavBar from '~/components/AdminNavBar';
import LogoutButton from '~/components/LogoutButton';
import { MdAutoAwesome } from 'react-icons/md';
import { FaTools } from 'react-icons/fa';
import { IconContext } from 'react-icons/lib';

type LoaderData = {
	services: Awaited<ReturnType<typeof getServices>>;
};

export const loader: LoaderFunction = async () => {
	const services = await getServices();
	return json<LoaderData>({ services });
};

export default function adminServiceRoute() {
	const { services } = useLoaderData() as LoaderData;
	return (
		<>
			<header className='container header'>
				<Link to='/board/admin' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to Board
				</Link>
				<AdminNavBar />
				<div className='header-flex'>
					<h1>Manage Service List</h1>
					<LogoutButton />
				</div>
			</header>
			<main className='flex-container-2-col'>
				{services.length ? (
					<div>
						<p className='inline-left'>
							<IconContext.Provider value={{ color: '#a9a5c0' }}>
								<MdAutoAwesome className='icon-size icon-container' />
							</IconContext.Provider>
							Service List:&nbsp;<span>{services.length}</span>&nbsp;services
						</p>
						<nav className='nav-ul-container'>
							<ul>
								{services.map((service) => (
									<li key={service.serviceId} className='inline-between'>
										<NavLink
											to={service.serviceId}
											prefetch='intent'
											className={({ isActive }) =>
												isActive ? 'active inline-between' : undefined
											}
										>
											<span>{service.name}</span>
										</NavLink>
										&nbsp;
										<Link to={`/board/admin/services/${service.serviceId}`}>
											View
										</Link>
									</li>
								))}
							</ul>
						</nav>
					</div>
				) : (
					<p className='form-container form-content'>
						No service available yet
					</p>
				)}
				<div>
					<Outlet />
				</div>
			</main>
		</>
	);
}

export function ErrorBoundary({ error }: { error: Error }) {
	console.error(error);
	return (
		<div className='error-container'>
			<div className='form-container form-container-message form-content'>
				Something unexpected went wrong. Sorry about that.
			</div>
		</div>
	);
}
