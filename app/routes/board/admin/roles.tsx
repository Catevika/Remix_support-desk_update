import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, Link, NavLink } from '@remix-run/react';
import { getRoles } from '~/models/roles.server';
import AdminNavBar from '~/components/AdminNavBar';
import LogoutButton from '~/components/LogoutButton';
import { MdMiscellaneousServices } from 'react-icons/md';
import { FaTools } from 'react-icons/fa';

type LoaderData = {
	roles: Awaited<ReturnType<typeof getRoles>>;
};

export const loader: LoaderFunction = async () => {
	const roles = await getRoles();

	return json<LoaderData>({ roles });
};

export default function adminRoleRoute() {
	const { roles } = useLoaderData() as LoaderData;
	return (
		<>
			<header className='container header'>
				<Link to='/board/admin' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to Board
				</Link>
				<AdminNavBar />
				<div className='header-flex'>
					<h1>Manage Role List</h1>
					<LogoutButton />
				</div>
			</header>
			<main className='flex-container-2-col'>
				{roles.length ? (
					<div>
						<p className='inline-left'>
							<MdMiscellaneousServices className='icon-size icon-container' />
							Role List:&nbsp;<span>{roles.length}</span>&nbsp;roles
						</p>
						<nav className='nav-ul-container'>
							<ul>
								{roles.map((role) => (
									<li key={role.roleId} className='inline-between'>
										<NavLink
											to={role.roleId}
											prefetch='intent'
											className={({ isActive }) =>
												isActive ? 'active' : undefined
											}
										>
											<span>{role.roleType}</span>
										</NavLink>
										&nbsp;
										<Link to={`/board/admin/roles/${role.roleId}`}>View</Link>
									</li>
								))}
							</ul>
						</nav>
					</div>
				) : (
					<p className='form-container form-content'>No role available yet</p>
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
