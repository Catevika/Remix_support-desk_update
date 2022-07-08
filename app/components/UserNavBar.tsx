import { NavLink } from '@remix-run/react';

function UserNavBar() {
  return (
    <nav>
      <ul className='nav-links'>
        <li>
          <NavLink to={'/board/employee/tickets/new-user'} className={({ isActive }) =>
            isActive ? 'active' : undefined
          }>
            New User
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/employee/tickets'} className={({ isActive }) =>
            isActive ? 'active' : undefined
          }>
            User Tickets
          </NavLink>
        </li>
        <li>
          <NavLink to={'/board/employee/tickets/notes'} className={({ isActive }) =>
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