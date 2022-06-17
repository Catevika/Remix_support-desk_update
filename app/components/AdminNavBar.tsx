import { NavLink } from '@remix-run/react';

function AdminNavBar() {
  return (
    <nav>
      <ul className='nav-links'>
        <li>
          <NavLink to={'/board/admin/users/new-user'} className={({ isActive }) =>
            isActive ? 'active' : undefined
          }>
            Users
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/services/new-service'} className={({ isActive }) =>
            isActive ? 'active' : undefined
          }>
            Services
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/products/new-product'} className={({ isActive }) =>
            isActive ? 'active' : undefined
          }>
            Products
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/roles/new-role'} className={({ isActive }) =>
            isActive ? 'active' : undefined
          }>
            Roles
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/status/new-status'} className={({ isActive }) =>
            isActive ? 'active' : undefined
          }>
            Status
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default AdminNavBar;