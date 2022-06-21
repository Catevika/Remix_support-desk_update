import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Outlet, useLoaderData, Link, useCatch, useLocation } from '@remix-run/react';
import { getUserId } from '~/utils/session.server';
import { getTicketListingByUserId } from '~/models/tickets.server';
import { MdMiscellaneousServices } from 'react-icons/md';
import { FaTools } from 'react-icons/fa';
import { Product, Status } from '@prisma/client';

type LoaderData = {
	ticketsByUserId: Array<{ authorId: string; ticketId: string; title: string; createdAt: Date; updatedAt: Date; ticketStatus: Status; ticketProduct: Product; }> | string;
};

export const loader: LoaderFunction = async ({ request }) => {
	const userId = await getUserId(request);
	const ticketsByUserId = await getTicketListingByUserId(userId);
	return json<LoaderData>({ ticketsByUserId });
};

// TODO: Add service to ticket everywhere it is needed to be able to get the number of tickets per service
// TODO: Add a pagination to ticket list
// TODO: Add a search field to ticket list

export default function TicketsRoute() {
	const { ticketsByUserId } = useLoaderData() as LoaderData;
	const pathname = useLocation().pathname;

	return (
		<>
			<header className='container header'>
				<Link to='/board/employee' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to Board
				</Link>
				<h1>Create New Ticket</h1>
				<Form action='/logout' method='post'>
					<button type='submit' className='btn'>
						Logout
					</button>
				</Form>
			</header>
			<main className='grid-container'>
				<div>
					<div>
						<MdMiscellaneousServices className='icon-size icon-container' />
						<p>Your tickets:&nbsp;
							{pathname === '/board/employee/tickets'
								? (<Link to='/board/employee/tickets/new-ticket'><span>Create new ticket</span></Link>)
								: null}
						</p>
					</div>
					{ticketsByUserId.length && (typeof ticketsByUserId !== 'string') ? (
						<div className='nav-ul-container'>
							{
								ticketsByUserId.map((ticket) => (
									<ul key={ticket.ticketId}>
										<li className='list border-bottom'>Title:&nbsp;<Link to={ticket.ticketId} prefetch='intent'><span>{ticket.title}</span></Link></li>
										<li className='list'>Id:&nbsp;<span>{ticket.ticketId}</span></li>
										<li className='list' >Status:&nbsp;<span className={
											ticket.ticketStatus.type
												? `status status-${ticket.ticketStatus.type}`
												: undefined
										}>{ticket.ticketStatus.type}</span></li>
										<li className='list'>Product:&nbsp;<span>{ticket.ticketProduct.device}</span></li>
										<li className='list'>Date:&nbsp;{new Date(ticket.createdAt).toLocaleString() !== new Date(ticket.updatedAt).toLocaleString() ? <span>{new Date(ticket.updatedAt).toLocaleString()}</span> : <span>{new Date(ticket.createdAt).toLocaleString()}</span>}</li>
									</ul>
								))
							}
						</div>
					) : <p>No ticket available yet</p>}
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
			<div className='form-container form-content'>
				Something unexpected went wrong. Sorry about that.
			</div>
		</div>
	);
}
