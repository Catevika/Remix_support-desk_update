import { json, LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData, Link, NavLink, useCatch, Outlet } from '@remix-run/react';
import { getProducts } from '~/models/products.server';
import AdminNavBar from '~/components/AdminNavBar';
import LogoutButton from '~/components/LogoutButton';
import { MdOutlineDevicesOther } from 'react-icons/md';
import { FaTools } from 'react-icons/fa';

type LoaderData = {
	products: Awaited<ReturnType<typeof getProducts>>;
};

export const loader: LoaderFunction = async () => {
	const products = await getProducts();
	return json<LoaderData>({ products });
};

export default function ProductsRoute() {
	const { products } = useLoaderData() as LoaderData;

	return (
		<>
			<header className='container header'>
				<Link to='/board/admin' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to Board
				</Link>
				<AdminNavBar />
				<LogoutButton />
				<h1>Manage Product List</h1>
			</header>
			<main className='grid-container'>
				{products.length ? (
					<div>
						<p className='inline-left'>
							<MdOutlineDevicesOther className='icon-size icon-container' />
							Available products:&nbsp;<span>{products.length}</span>
						</p>
						<p className='inline-left'>
						{products.length && (typeof products !== 'string') 
						? <em>To update a Product, click on its title</em>
						: 'No product available yet'}
					</p>
						<div className='nav-ul-container'>
							<ul>
								{products.map((product) => (
									<li key={product.productId}>
										<NavLink to={product.productId} prefetch='intent' className={({ isActive }) =>
											isActive ? 'active' : undefined
										}>
											{product.device}
										</NavLink>
										<Form method='post'></Form>
									</li>
								))}
							</ul>
						</div>
					</div>
				) : "No product available yet."}
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
					<p>You must be logged in with administrator rights to add a new product.</p>
					<Link to='/login?redirectTo=/board/admin/products/new-product'>
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
