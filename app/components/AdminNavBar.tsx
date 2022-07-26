import { NavLink } from '@remix-run/react';

function AdminNavBar() {
	return (
		<nav id='menu-toggle'>
			<input id='checkbox' type='checkbox' />
			<span></span>
			<span></span>
			<span></span>
			<ul id='menu' className='admin-nav-links'>
				<li>
					<NavLink
						to={'/board/admin/users/userlist'}
						className={({ isActive }) => (isActive ? 'active' : undefined)}
					>
						Users
					</NavLink>
				</li>
				<li>
					<NavLink
						to={'/board/admin/users/ticketlist'}
						className={({ isActive }) => (isActive ? 'active' : undefined)}
					>
						Tickets
					</NavLink>
				</li>
				<li>
					<NavLink
						to={'/board/admin/users/notelist'}
						className={({ isActive }) => (isActive ? 'active' : undefined)}
					>
						Notes
					</NavLink>
				</li>
				<li>
					<NavLink
						to={'/board/admin/services/new-service'}
						className={({ isActive }) => (isActive ? 'active' : undefined)}
					>
						Services
					</NavLink>
				</li>
				<li>
					<NavLink
						to={'/board/admin/products/new-product'}
						className={({ isActive }) => (isActive ? 'active' : undefined)}
					>
						Products
					</NavLink>
				</li>
				<li>
					<NavLink
						to={'/board/admin/roles/new-role'}
						className={({ isActive }) => (isActive ? 'active' : undefined)}
					>
						Roles
					</NavLink>
				</li>
				<li>
					<NavLink
						to={'/board/admin/status/new-status'}
						className={({ isActive }) => (isActive ? 'active' : undefined)}
					>
						Status
					</NavLink>
				</li>
			</ul>
		</nav>
	);
}

export default AdminNavBar;
