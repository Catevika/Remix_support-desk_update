import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Form, Outlet, useLoaderData, Link, useCatch, useLocation } from '@remix-run/react';
import { getUserId } from '~/utils/session.server';
import { getTicketListingByUserId } from '~/models/tickets.server';
import LogoutButton from '~/components/LogoutButton';
import { MdMiscellaneousServices } from 'react-icons/md';
import { FaTools } from 'react-icons/fa';

type LoaderData = {
	ticketsByUserId: Awaited<ReturnType<typeof getTicketListingByUserId>>;
};

export const loader: LoaderFunction = async ({ request }) => {
	const userId = await getUserId(request);
	const ticketsByUserId = await getTicketListingByUserId(userId);

	return json<LoaderData>({ ticketsByUserId });
};

export default function TicketsRoute() {
	const { ticketsByUserId } = useLoaderData() as LoaderData;

	return (
		<>
			<header className='container header'>
				<Link to='/board/employee' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to Board
				</Link>
				<h1>Manage your Tickets</h1>
				<LogoutButton />
			</header>
			<main className='grid-container'>
				<div>
					<p className='inline-left'>
					<MdMiscellaneousServices className='icon-size icon-container' />
						Your tickets:&nbsp;<span>{ticketsByUserId.length}</span>
					</p>
					<p className='inline-left'>
					{ticketsByUserId.length && (typeof ticketsByUserId !== 'string') 
						? <em>To update a Ticket, click on its title</em>
						: 'No ticket available yet'}
					</p>
					{ticketsByUserId.length && (typeof ticketsByUserId !== 'string') ? (
						<div className='nav-ul-container'>
							{
								ticketsByUserId.map((ticket) => (
									<ul key={ticket.ticketId}>
										<li className='list border-bottom'>Title:&nbsp;<Link to={ticket.ticketId} prefetch='intent'><span>{ticket.title}</span></Link></li>
										<li className='list'>Id:&nbsp;<span>{ticket.ticketId}</span></li>
										<li className='list' >Status:&nbsp;<span className={
											ticket?.ticketStatus?.type
												? `status status-${ticket?.ticketStatus.type}`
												: undefined
										}>{ticket?.ticketStatus?.type}</span></li>
										<li className='list'>Product:&nbsp;<span>{ticket?.ticketProduct?.device}</span></li>
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
