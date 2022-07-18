import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, Link, useCatch, Form, useSearchParams, useLocation } from '@remix-run/react';
import { getTickets, getTicketsBySearchTerm } from '~/models/tickets.server';
import AdminUserNavBar from "~/components/AdminUserNavBar";
import LogoutButton from '~/components/LogoutButton';
import { MdMiscellaneousServices } from 'react-icons/md';
import { FaSearch, FaTools } from 'react-icons/fa';
import { useEffect, useRef } from 'react';

type LoaderData = {
	tickets: Awaited<ReturnType<typeof getTickets>>;
	getTicketsBySearchTerm: Awaited<ReturnType<typeof getTicketsBySearchTerm>>;
};

export const loader: LoaderFunction = async ({request}) => {
	const url = new URL(request.url)
  const query = url.searchParams.get(("query").toLowerCase());
	const tickets = query ? await getTicketsBySearchTerm(query) : await getTickets();
  return json({tickets});
};

export default function adminTicketListRoute() {
	const { tickets } = useLoaderData() as LoaderData;
	const [params] = useSearchParams();
  const location = useLocation();
  const query = params.get(("query").toLowerCase());

  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    if(query) {
      formRef.current?.reset();
    }
  }, [query])

	return (
		<>
			<header className='container header'>
				<Link to='/board/admin/users' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to User Board
				</Link>
				<AdminUserNavBar />
				<LogoutButton />
				<h1>Manage Ticket List</h1>
			</header>
			<main>
				<div>
					<p className='inline-left'>
					<MdMiscellaneousServices className='icon-size icon-container' />
						Ticket List:&nbsp;<span>{tickets.length}</span>&nbsp;tickets
					</p>
					<Form ref={formRef} method="get" action='/board/admin/users/ticketlist' className='search-container'>
						<label htmlFor="query" className='form-group search-inline'>Search:&nbsp;
							<input type="search" name="query" id="query" placeholder='Search by title, author, status or product' aria-label="Search ticket by by title, author, status or product" defaultValue={query ?? undefined } className="search-input"/>
							<button type="submit" className="btn btn-search btn-small">
								<FaSearch className='search-icon' />
							</button>
						<Link to='/board/admin/users/ticketlist' className='link-search'>
              Back to complete ticket list
            </Link>
          </label>
					</Form>
					{tickets.length && (typeof tickets !== 'string') ? (
						<div className='flex-container'>
							{
								tickets.map((ticket) => (
									<ul key={ticket.ticketId} className='card'>
										<li className='inline-between border-bottom'>Title:&nbsp;<Link to={{ pathname: `/board/admin/users/ticketlist/${ticket.ticketId}`, search: location.search }} prefetch='intent'><span>{ticket.title}</span></Link><Link to={{ pathname: `/board/admin/users/ticketlist/${ticket.ticketId}`, search: location.search }} prefetch='intent'>View</Link></li>
										<li className='list' >Author:&nbsp;<span>{ticket?.author?.username}</span></li>
										<li className='list' >Status:&nbsp;<span className={
											ticket?.ticketStatus?.type
												? `status status-${ticket?.ticketStatus.type}`
												: undefined
										}>{ticket?.ticketStatus?.type}</span></li>
										<li className='list'>Product:&nbsp;<span>{ticket?.ticketProduct?.device}</span></li>
										<li className='list'>Date:&nbsp;{new Date(ticket.createdAt).toLocaleString('en-us') !== new Date(ticket.updatedAt).toLocaleString('en-us') ? <span>{new Date(ticket.updatedAt).toLocaleString('en-us')}</span> : <span>{new Date(ticket.createdAt).toLocaleString('en-us')}</span>}</li>
									</ul>
								))
							}
						</div>
					) : 'No ticket available yet'}
				</div>
				<div>
					<Outlet />
				</div>
			</main>
		</>
	);
}

export function CatchBoundary() {
	const caught = useCatch();

	if (caught.status === 401) {
		return (
			<div className='error-container'>
				<div className='form-container form-content'>
					<p>You must be logged in to create a ticket.</p>
					<Link to='/login?redirectTo=/tickets/new-ticket'>
						<button className='btn form-btn'>Login</button>
					</Link>
				</div>
			</div>
		);
	}
	throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary({ error }: { error: Error; }) {
	console.error(error);
	return (
		<div className='error-container'>
			<div className='form-container form-container-message form-content'>
				Something unexpected went wrong. Sorry about that.
			</div>
		</div>
	);
}
