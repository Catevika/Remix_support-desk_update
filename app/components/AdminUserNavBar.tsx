import { NavLink } from '@remix-run/react';

function AdminNavBar() {
  return (
    <nav>
      <ul className='nav-links'>
        <li>
          <NavLink to={'/board/admin/users/userlist'}>
            User List
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/users/ticketlist'}>
            User Tickets
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/users/tickets/notes'}>
            User Notes
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default AdminNavBar;