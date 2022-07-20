import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, Link, NavLink, useCatch } from '@remix-run/react';
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
			<main className='grid-container'>
				{roles.length ? (
					<div>
						<p className='inline-left'>
							<MdMiscellaneousServices className='icon-size icon-container' />
							Available roles:&nbsp;<span>{roles.length}</span>
						</p>
						<nav className='nav-ul-container'>
							<ul>
								{roles.map((role) => (
									<li key={role.roleId} className='inline-between'>
										<NavLink to={role.roleId} prefetch='intent' className={({ isActive }) =>
											isActive ? 'active' : undefined
										}>
											<span>{role.roleType}</span>
										</NavLink>&nbsp;<Link to={`/board/admin/roles/${role.roleId}`}>View</Link>
									</li>
								))}
							</ul>
						</nav>
					</div>
				) : <p className='form-container form-content'>No role available yet</p>}
				<div>
					<Outlet />
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
					<p>You must be logged in with administrator rights to create a new role.</p>
					<Link to='/login?redirectTo=/board/admin/roles/new-role'>
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
			<div className='form-container form-container-message form-content'>
				Something unexpected went wrong. Sorry about that.
			</div>
		</div>
	);
}
