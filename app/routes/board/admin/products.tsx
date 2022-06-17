import { json, LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData, Link, NavLink, useCatch, Outlet } from '@remix-run/react';
import { getProducts } from '~/models/products.server';
import { MdOutlineDevicesOther } from 'react-icons/md';
import { FaTools } from 'react-icons/fa';
import AdminNavBar from '~/components/AdminNavBar';

type LoaderData = {
	products: Awaited<ReturnType<typeof getProducts>>;
};

export const loader: LoaderFunction = async () => {
	const products = await getProducts();
	return json<LoaderData>({ products });
};

/* TODO: Add a pagination to product list  */
// TODO: Add a search field to product list

export default function ProductsRoute() {
	const { products } = useLoaderData() as LoaderData;

	return (
		<>
			<header className='container header'>
				<Link to='/board/admin' className='icon-header'>
					<FaTools className='icon-size icon-shadow' /> Back to Board
				</Link>
				<AdminNavBar />
				<h1>Create New Product</h1>
				<Form action='/logout' method='post'>
					<button type='submit' className='btn'>
						Logout
					</button>
				</Form>
			</header>
			<main className='grid-container'>
				{products.length ? (
					<>
						<div>
							<MdOutlineDevicesOther className='icon-size icon-container' />
							<p>Available products:&nbsp;<span>{products.length}</span></p>
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
					</>
				) : "No product available yet."}
				<div>
					<div>
						<Outlet />
					</div>
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
