import type { MetaFunction, LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import appStyles from '~/styles/app.css';
import formStyles from '~/styles/form.css';

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Support-Desk",
  viewport: "width=device-width,initial-scale=1"
});

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: appStyles },
    { rel: 'stylesheet', href: formStyles }
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
