import type { MetaFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, NavLink, Outlet, Link } from '@remix-run/react';
import { requireAdminUser } from '~/utils/session.server';
import LogoutButton from '~/components/LogoutButton';
import { FaTools } from 'react-icons/fa';

export const meta: MetaFunction = () => {
  return {
    title: 'Support-Desk | Admin Board'
  };
};

type LoaderData = {
  admin: Awaited<ReturnType<typeof requireAdminUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const admin = await requireAdminUser(request);
  
  return json<LoaderData>({ admin });
};

export default function adminBoardRoute() {
  const { admin } = useLoaderData() as LoaderData;

  return (
    <>
      <header className='container header'>
        <Link to='/board/admin' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to Board
				</Link>
        <h1>User Board</h1>
        <LogoutButton />
      </header>
      <main>
        <p className='main-text'>
          Hi&nbsp;
          <span className='capitalize'>
            {admin?.username ? admin.username : null}
          </span>
          , which listing would you like to view?
        </p>
      </main>
      <nav className='nav'>
        <ul>
          <li>
            <NavLink to={'/board/admin/users/userlist'}>
              User List
            </NavLink>
          </li>
          <li>
            <NavLink to={'/board/admin/users/tickets'}>
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
      <main>
        <div>
          <Outlet />
        </div>
      </main>
    </>
  );
};

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