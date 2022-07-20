import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData, Link, useCatch, Form, useSearchParams, useLocation } from '@remix-run/react';
import { getAllNotes, getNotesBySearchTerm } from '~/models/notes.server';
import AdminNavBar from "~/components/AdminNavBar";
import LogoutButton from '~/components/LogoutButton';
import { MdMiscellaneousServices } from 'react-icons/md';
import { FaSearch, FaTools } from 'react-icons/fa';
import { useEffect, useRef } from 'react';

type LoaderData = {
	notes: Awaited<ReturnType<typeof getAllNotes>>;
	getNotesBySearchTerm: Awaited<ReturnType<typeof getNotesBySearchTerm>>;
};

export const loader: LoaderFunction = async ({request}) => {
	const url = new URL(request.url)
  const query = url.searchParams.get(("query").toLowerCase());
	const notes = query ? await getNotesBySearchTerm(query) : await getAllNotes();
  return json({notes});
};

export default function adminNoteListRoute() {
	const { notes } = useLoaderData() as LoaderData;
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
				<Link to='/board/admin' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to Board
				</Link>
				<AdminNavBar />
				<div className='header-flex'>
					<h1>Manage Note List</h1>
					<LogoutButton />
				</div>
			</header>
			<main>
				<div>
					<p className='inline-left'>
					<MdMiscellaneousServices className='icon-size icon-container' />
						Note List:&nbsp;<span>{notes.length}</span>&nbsp;notes
					</p>
					<Form ref={formRef} method="get" action='/board/admin/users/notelist' className='search-container'>
						<label htmlFor="query" className='form-group search-inline'>Search:&nbsp;
							<input type="search" name="query" id="query" placeholder='Search by title, author or text note' aria-label="Search note by title, author or text note" defaultValue={query ?? undefined } className="search-input"/>
							<button type="submit" className="btn btn-search btn-small">
								<FaSearch className='search-icon' />
							</button>
						<Link to='/board/admin/users/notelist' className='link-search'>
              Back to complete note list
            </Link>
          </label>
					</Form>
					{notes.length && (typeof notes !== 'string') ? (
						<div className='flex-container'>
							{
								notes.map((note) => (
									<ul key={note.noteId} className='card'>
										<li className='inline-between border-bottom'>Title:&nbsp;<Link to={{ pathname: `/board/admin/users/notelist/${note.noteId}`, search: location.search }} prefetch='intent'><span>{note.noteTicket.title}</span></Link><Link to={{ pathname: `/board/admin/users/notelist/${note.noteId}`, search: location.search }} prefetch='intent'>View</Link></li>
										<li className='list' >Author:&nbsp;<span>{note.noteUser.username}</span></li>
										<li className='list' >Product:&nbsp;<span>{note.noteTicket.ticketProduct?.device}</span></li>
										<li className='list' >Text:&nbsp;<span >{note.text}</span></li>
										<li className='list'>Date:&nbsp;{new Date(note.createdAt).toLocaleString('en-us') !== new Date(note.updatedAt).toLocaleString('en-us') ? <span>{new Date(note.updatedAt).toLocaleString('en-us')}</span> : <span>{new Date(note.createdAt).toLocaleString('en-us')}</span>}</li>
									</ul>
								))
							}
						</div>
					) : <p className='form-container form-content'>No note available yet</p>}
				</div>
				<div>
					<Outlet />
				</div>
			</main>
		</>
	);
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
