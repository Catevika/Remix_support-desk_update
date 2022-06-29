import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData, useLocation, useSearchParams } from "@remix-run/react";
import { FaSearch, FaTools } from "react-icons/fa";
import UserNavBar from "~/components/UserNavBar";
import LogoutButton from "~/components/LogoutButton";
import { getUsers } from "~/models/user.server";

// TODO - Add search functionality

type LoaderData = {
  users: Awaited<ReturnType<typeof getUsers>>;
}

export const loader: LoaderFunction = async () => {
  const users = await getUsers();


  const data: LoaderData = {
    users
  }

  return data;
}

export default function userListRoute() {
  const { users } = useLoaderData() as LoaderData;

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
        <Form method="post" className='search-container'>
          <label htmlFor="search-user" className='form-group search-inline search-label'>Search:&nbsp;
            <input type="search" name="search-user" id="search-user" placeholder='Search user by username' className="search-input"/>
            <button type="submit" className="btn btn-search"><FaSearch className='search-icon' /></button>
          </label>
        </Form>
        <div className='flex-container'>
          {users ? users.map(user => (
            <ul key={user.id} className="user-card">
              <li>UserId:&nbsp;<span><Link to={`/board/admin/users/userlist/${user.id}`}>{user.id}</Link></span></li>
              <li>Username:&nbsp;<span>{user.username}</span></li>
              <li>Email:&nbsp;<span>{user.email}</span></li>
              <li>Service:&nbsp;<span>{user.service}</span></li>
              <li>CreatedAt:&nbsp;<span>{new Date(user.createdAt).toLocaleString()}</span></li>
              <li>UpdatedAt:&nbsp;<span>{new Date(user.updatedAt).toLocaleString()}</span></li>
            </ul>
            )) : <p>No users yet.</p>
          } 
          <div>
            <Outlet />
          </div>
        </div>
      </main>
    </>
  )
}