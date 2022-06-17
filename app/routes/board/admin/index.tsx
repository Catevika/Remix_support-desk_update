import type { MetaFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link, Form, Outlet } from '@remix-run/react';
import { requireAdminUser } from '~/utils/session.server';
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
        <FaTools className='icon-size icon-shadow' />
        <h1>Main Board</h1>
        <Form action='/logout' method='post'>
          <button type='submit' className='btn'>
            Logout
          </button>
        </Form>
      </header>
      <main>
        <p className='main-text'>
          Hi&nbsp;
          <span className='capitalize'>
            {admin?.username ? admin.username : null}
          </span>
          , which database would you like to manage?
        </p>
      </main>
      <nav className='nav'>
        <ul>
          <li>
            <Link to={'/board/admin/users/new-user'}>
              Users - <span>TODO userlist / userTickets / userNotes ?</span>
            </Link>
          </li>
          <li>
            <Link to={'/board/admin/services/new-service'}>
              Services
            </Link>
          </li>
          <li>
            <Link to={'/board/admin/products/new-product'}>
              Products
            </Link>
          </li>
          <li>
            <Link to={'/board/admin/roles/new-role'}>
              Roles
            </Link>
          </li>
          <li>
            <Link to={'/board/admin/status/new-status'}>
              Status
            </Link>
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
