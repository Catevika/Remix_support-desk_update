import { NavLink } from '@remix-run/react';

function UserNavBar() {
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
          <NavLink to={'/board/admin/users/tickets'} className={({ isActive }) =>
            isActive ? 'active' : undefined
          }>
            User Tickets
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/admin/users/tickets/notes'} className={({ isActive }) =>
            isActive ? 'active' : undefined
          }>
            User Notes
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default UserNavBar;