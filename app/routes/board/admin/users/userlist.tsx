import type { LoaderFunction } from "@remix-run/node";
import { Form, Link, useLoaderData, useLocation, useSearchParams } from "@remix-run/react";
import { FaSearch, FaTools } from "react-icons/fa";
import UserNavBar from "~/components/UserNavBar";
import LogoutButton from "~/components/LogoutButton";
import { getUsersBySearchTerm} from "~/models/user.server";

type LoaderData = {
  users: Awaited<ReturnType<typeof getUsersBySearchTerm>>;
}

export const loader: LoaderFunction = async ({request}) => {
  const url = new URL(request.url)
  const search = new URLSearchParams(url.search);
  return await getUsersBySearchTerm(search.get("query"))
  }

export default function userListRoute() {
  const { users } = useLoaderData() as LoaderData;
  const [params] = useSearchParams();
  const location = useLocation();

  console.log(users, [params], location)

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
        <Form method="get" className='search-container'>
          <label htmlFor="search-user" className='form-group search-inline search-label'>Search:&nbsp;
            <input type="text" name="query" id="query" placeholder='Search user by username' defaultValue={params.get('query')} className="search-input"/>
            <Link to='/board/admin/users/userlist'><button type="submit" className="btn btn-search"><FaSearch className='search-icon' /></button></Link>
          </label>
        </Form>
        <div className='flex-container'>
          {users ? users.map(user => (
            <ul key={user.id} className="user-card">
              <li>UserId:&nbsp;<span><Link to={{ pathname: user.id, search: location.search }}>{user.id}</Link></span></li>
              <li>Username:&nbsp;<span>{user.username}</span></li>
              <li>Email:&nbsp;<span>{user.email}</span></li>
              <li>Service:&nbsp;<span>{user.service}</span></li>
              <li>CreatedAt:&nbsp;<span>{new Date(user.createdAt).toLocaleString()}</span></li>
              <li>UpdatedAt:&nbsp;<span>{new Date(user.updatedAt).toLocaleString()}</span></li>
            </ul>
            )) : <p>No users yet.</p>
          } 
        </div>
      </main>
    </>
  )
}