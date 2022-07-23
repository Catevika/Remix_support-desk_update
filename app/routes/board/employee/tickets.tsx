import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, Link, useCatch } from '@remix-run/react';
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

export default function employeeTicketRoute() {
	const { ticketsByUserId } = useLoaderData() as LoaderData;

	return (
		<>
			<header className='container header'>
				<Link to='/board/employee' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to Board
				</Link>
				<p>My Tickets</p>
				<LogoutButton />
			</header>
			<main className='flex-container-2-col'>
				<div className='flex-center'>
					<h1 className='inline-left'>
						<MdMiscellaneousServices className='icon-size icon-container' />
						My tickets:&nbsp;<span>{ticketsByUserId.length}</span>
					</h1>
					{ticketsByUserId.length && typeof ticketsByUserId !== 'string' ? (
						<div className='nav-ul-container'>
							{ticketsByUserId.map((ticket) => (
								<ul key={ticket.ticketId} className='card'>
									<li className='inline-between border-bottom'>
										Title:&nbsp;
										<Link to={ticket.ticketId} prefetch='intent'>
											<span>{ticket.title}</span>
										</Link>
										<Link to={ticket.ticketId} prefetch='intent'>
											View
										</Link>
									</li>
									<li className='list'>
										Author:&nbsp;<span>{ticket?.author?.username}</span>
									</li>
									<li className='list'>
										Status:&nbsp;
										<span
											className={
												ticket?.ticketStatus?.type
													? `status status-${ticket?.ticketStatus.type}`
													: undefined
											}
										>
											{ticket?.ticketStatus?.type}
										</span>
									</li>
									<li className='list'>
										Product:&nbsp;<span>{ticket?.ticketProduct?.device}</span>
									</li>
									<li className='list'>
										Notes:&nbsp;<span>{ticket?.Notes.length}</span>
									</li>
									<li className='list'>
										Date:&nbsp;
										{new Date(ticket.createdAt).toLocaleString('en-us') !==
										new Date(ticket.updatedAt).toLocaleString('en-us') ? (
											<span>
												{new Date(ticket.updatedAt).toLocaleString('en-us')}
											</span>
										) : (
											<span>
												{new Date(ticket.createdAt).toLocaleString('en-us')}
											</span>
										)}
									</li>
								</ul>
							))}
						</div>
					) : (
						<p className='form-container form-content'>
							No ticket available yet
						</p>
					)}
				</div>
				<Outlet />
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

export function ErrorBoundary({ error }: { error: Error }) {
	console.error(error);
	return (
		<div className='error-container'>
			<div className='form-container form-container-message form-content'>
				Something unexpected went wrong. Sorry about that.
			</div>
		</div>
	);
}
