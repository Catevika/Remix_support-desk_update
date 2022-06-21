import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, Form, useLoaderData, Link, NavLink, useCatch } from '@remix-run/react';
import { getRoles } from '~/models/roles.server';
import { MdMiscellaneousServices } from 'react-icons/md';
import { FaTools } from 'react-icons/fa';
import AdminNavBar from '~/components/AdminNavBar';

type LoaderData = {
	roles: Awaited<ReturnType<typeof getRoles>>;
};

export const loader: LoaderFunction = async () => {
	const roles = await getRoles();

	return json<LoaderData>({ roles });
};

// TODO: Add a pagination to role list
// TODO: Add a search field to role list

export default function RolesRoute() {
	const { roles } = useLoaderData() as LoaderData;
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
				<h1>Create New Role</h1>
			</header>
			<main className='grid-container'>
				{roles.length ? (
					<>
						<div>
							<MdMiscellaneousServices className='icon-size icon-container' />
							<p>Available roles:&nbsp;<span>{roles.length}</span></p>
							<ul>
								{roles.map((role) => (
									<li key={role.roleId}>
										<NavLink to={role.roleId} prefetch='intent' className={({ isActive }) =>
											isActive ? 'active' : undefined
										}>
											{role.roleType}
										</NavLink>
									</li>
								))}
							</ul>
						</div>
					</>
				) : "No role available yet."}
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
					<p>You must be logged in with administrator rights to create a role.</p>
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
			<div className='form-container form-content'>
				Something unexpected went wrong. Sorry about that.
			</div>
		</div>
	);
}
