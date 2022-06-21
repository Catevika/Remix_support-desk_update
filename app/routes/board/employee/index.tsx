import type { MetaFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link, Form } from '@remix-run/react';
import { requireUser } from '~/utils/session.server';
import { FaTools, FaQuestionCircle, FaTicketAlt } from 'react-icons/fa';
import { CgProfile } from 'react-icons/cg';
import { getTicketListingByUserId } from '~/models/tickets.server';

export const meta: MetaFunction = () => {
  return {
    title: 'Support-Desk | Employee Board'
  };
};

type LoaderData = {
  user: Awaited<ReturnType<typeof requireUser>>;
  tickets: Awaited<ReturnType<typeof getTicketListingByUserId>> | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  const tickets = await getTicketListingByUserId(user.id);
  
  return json<LoaderData>({ user, tickets });
}

export default function userBoardRoute(): JSX.Element {
  const { user, tickets } = useLoaderData<LoaderData>();
  const lastTicket = tickets ? tickets[0] : null;

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
            {user?.username ? user.username : null}
          </span>
          , what do you need help with?
        </p>
      </main>
      {user ? (
        <nav className='nav'>
          <ul>
            <li>
              <Link
                to='/board/employee/tickets/new-ticket'
                className='btn btn-reverse btn-block nav-links'
              >
                <FaQuestionCircle className='icon-size icon-space' />
                &nbsp;Create New Ticket
              </Link>
            </li>
            <li>
              <Link to={(lastTicket && typeof lastTicket !== 'string') ? (`/board/employee/tickets/${lastTicket.ticketId}`) : ('/board/employee/tickets/new-ticket')} className='btn btn-block nav-links'>
                <FaTicketAlt className='icon-size icon-space' />
                &nbsp;View my Tickets
              </Link>
            </li>
            <li>
              <Link
                to={`/board/employee/users/${user.id}`}
                className='btn btn-block nav-links'
              >
                <CgProfile className='icon-size icon-space' />
                &nbsp;View my Profile
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </>
  );
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
