import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import {
	Outlet,
	useLoaderData,
	Link,
	Form,
	useSearchParams,
	useLocation
} from '@remix-run/react';
import { getAllNotes, getNotesBySearchTerm } from '~/models/notes.server';
import AdminNavBar from '~/components/AdminNavBar';
import LogoutButton from '~/components/LogoutButton';
import { MdMiscellaneousServices } from 'react-icons/md';
import { FaSearch, FaTools } from 'react-icons/fa';
import { useEffect, useRef } from 'react';

type LoaderData = {
	notes: Awaited<ReturnType<typeof getAllNotes>>;
	getNotesBySearchTerm: Awaited<ReturnType<typeof getNotesBySearchTerm>>;
};

export const loader: LoaderFunction = async ({ request }) => {
	const url = new URL(request.url);
	const query = url.searchParams.get('query'.toLowerCase());
	const notes = query ? await getNotesBySearchTerm(query) : await getAllNotes();
	return json({ notes });
};

export default function adminNoteListRoute() {
	const { notes } = useLoaderData() as LoaderData;
	const [params] = useSearchParams();
	const location = useLocation();
	const query = params.get('query'.toLowerCase());

	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (query) {
			formRef.current?.reset();
		}
	}, [query]);

	return (
		<>
			<header className='container header'>
				<Link to='/board/admin' className='icon-header'>
					<FaTools className='icon-size icon-shadow' />
					Back to Board
				</Link>
				<AdminNavBar />
				<div className='header-flex'>
					<h1>Notes</h1>
					<LogoutButton />
				</div>
			</header>
			<main>
				<div>
					<p className='inline-left'>
						<MdMiscellaneousServices className='icon-size icon-container' />
						<span>{notes.length}</span>&nbsp;notes
					</p>
					<span className='flex-container'>
						Search note by title, author or text note
					</span>
					<Form
						ref={formRef}
						method='get'
						action='/board/admin/users/notelist'
						className='search-container form-group'
					>
						<label htmlFor='query' className='label-search'>
							Search:
						</label>
						<input
							type='search'
							name='query'
							id='query'
							placeholder='?'
							aria-label='Search note by title, author or text note'
							defaultValue={query ?? undefined}
							className='search-input'
						/>
						<button type='submit' className='btn btn-search'>
							<FaSearch className='search-icon' />
						</button>
					</Form>
					<Link to='/board/admin/users/notelist' className='flex-container'>
						Back to complete note list
					</Link>
					{notes.length && typeof notes !== 'string' ? (
						<div className='flex-container flex-container-card'>
							{notes.map((note) => (
								<ul key={note.noteId} className='card'>
									<li className='inline-between border-bottom'>
										Title:&nbsp;
										<Link
											to={{
												pathname: `/board/admin/users/notelist/${note.noteId}`,
												search: location.search
											}}
											prefetch='intent'
										>
											<span>{note.noteTicket.title}</span>
										</Link>
										<Link
											to={{
												pathname: `/board/admin/users/notelist/${note.noteId}`,
												search: location.search
											}}
											prefetch='intent'
											className='view'
										>
											View
										</Link>
									</li>
									<li className='list'>
										Author:&nbsp;<span>{note.noteUser.username}</span>
									</li>
									<li className='list'>
										Product:&nbsp;
										<span>{note.noteTicket.ticketProduct?.device}</span>
									</li>
									<li className='list'>
										Text:&nbsp;<span>{note.text}</span>
									</li>
									<li className='list'>
										Date:&nbsp;
										{new Date(note.createdAt).toLocaleString('en-us', {
											month: '2-digit',
											day: '2-digit',
											year: '2-digit',
											hour: '2-digit',
											minute: '2-digit',
											hour12: false
										}) !==
										new Date(note.updatedAt).toLocaleString('en-us', {
											month: '2-digit',
											day: '2-digit',
											year: '2-digit',
											hour: '2-digit',
											minute: '2-digit',
											hour12: false
										}) ? (
											<span>
												{new Date(note.updatedAt).toLocaleString('en-us', {
													month: '2-digit',
													day: '2-digit',
													year: '2-digit',
													hour: '2-digit',
													minute: '2-digit',
													hour12: false
												})}
											</span>
										) : (
											<span>
												{new Date(note.createdAt).toLocaleString('en-us', {
													month: '2-digit',
													day: '2-digit',
													year: '2-digit',
													hour: '2-digit',
													minute: '2-digit',
													hour12: false
												})}
											</span>
										)}
									</li>
								</ul>
							))}
						</div>
					) : (
						<p className='form-container form-content'>No note available yet</p>
					)}
				</div>
				<div>
					<Outlet />
				</div>
			</main>
		</>
	);
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
