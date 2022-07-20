import { NavLink } from '@remix-run/react';

function AdminNavBar() {
  return (
    <nav>
      <ul className='nav-links'>
        <li>
          <NavLink to={'/board/admin/users/userlist'} className={({ isActive }) =>
            isActive ? 'active' : undefined
            }>
            User List
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/users/ticketlist'} className={({ isActive }) =>
            isActive ? 'active' : undefined
            }>
            Ticket List
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/users/notelist'} className={({ isActive }) =>
            isActive ? 'active' : undefined
            }>
            Note List
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/services/new-service'} className={({ isActive }) =>
            isActive ? 'active' : undefined
          }>
            Service List
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/products/new-product'} className={({ isActive }) =>
            isActive ? 'active' : undefined
          }>
            Product List
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/roles/new-role'} className={({ isActive }) =>
            isActive ? 'active' : undefined
          }>
            Role List
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/status/new-status'} className={({ isActive }) =>
            isActive ? 'active' : undefined
          }>
            Status List
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default AdminNavBar;