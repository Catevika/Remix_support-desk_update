import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useLocation, useSearchParams } from "@remix-run/react";
import { FaSearch, FaTools } from "react-icons/fa";
import UserNavBar from "~/components/UserNavBar";
import LogoutButton from "~/components/LogoutButton";

import { getUsers, getUsersBySearchTerm } from "~/models/user.server";


type LoaderData = {
  users: Awaited<ReturnType<typeof getUsers>>;
  getUsersBySearchTerm: Awaited<ReturnType<typeof getUsersBySearchTerm>>;
}

export const loader: LoaderFunction = async ({request}) => {
  const url = new URL(request.url)
  const query = url.searchParams.get(("query").toLowerCase());
  const users = query ? await getUsersBySearchTerm(query) : await getUsers();
  return json({users});
}

export default function userListRoute() {
  const { users } = useLoaderData() as LoaderData;
  const [params] = useSearchParams();
  const location = useLocation();
  const query = params.get(("query").toLowerCase());

  return (
    <>
      <header className='container header'>
				<Link to='/board/admin/users' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to User Board
				</Link>
				<UserNavBar />
				<LogoutButton />
				<h1>Manage User Lists</h1>
			</header>
      <main>
        <Form method="get" action='/board/admin/users/userlist' className='search-container'>
          <label htmlFor="query" className='form-group search-inline'>Search:&nbsp;
            <input type="search" name="query" id="query" placeholder='Search by username, email or service' aria-label="Search user by username" defaultValue={query ?? '' } className="search-input"/>
            <button type="submit" className="btn btn-search btn-small">
              <FaSearch className='search-icon' />
            </button>
            <Link to='/board/admin/users/userlist' className='link-search' >
              Back to complete userlist
            </Link>
          </label>
        </Form>
        <div className='flex-container'>
          {
            users.map(user => (
              <ul key={user.id} className="user-card">
                <li>UserId:&nbsp;<Link to={{ pathname: `/board/admin/users/userlist/${user.id}`, search: location.search }}><span>{user.id}</span></Link></li>
                <li>Username:&nbsp;<span>{user.username}</span></li>
                <li>Email:&nbsp;<span>{user.email}</span></li>
                <li>Service:&nbsp;<span>{user.service}</span></li>
                <li>CreatedAt:&nbsp;<span>{new Date(user.createdAt).toLocaleString()}</span></li>
                <li>UpdatedAt:&nbsp;<span>{new Date(user.updatedAt).toLocaleString()}</span></li>
              </ul>
            ))
          } 
        </div>
      </main>
    </>
  )
}