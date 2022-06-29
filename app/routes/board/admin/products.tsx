import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData, Link, NavLink, useCatch, Outlet } from '@remix-run/react';
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