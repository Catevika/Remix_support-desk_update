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
            Ticket List
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/users/notelist'}>
            Note List
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default AdminNavBar;