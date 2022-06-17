import { createCookieSessionStorage, redirect } from "@remix-run/node";
import type { User } from "@prisma/client";
import { prisma } from "~/utils/db.server";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";
import { getUserByEmail, getUserById } from "../models/user.server";

export type { User } from "@prisma/client";

type RegisterForm = {
  username: string;
  email: string;
  password: string;
  service: string;
};

type LoginForm = {
  email: string;
  password: string;
};

export async function register({ username, email, password, service }: RegisterForm) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, email, passwordHash, service } });
  return { id: user.id, data: user };
}

export async function login({ email, password }: LoginForm) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isCorrectPassword) return null;
  return { id: user.id, email };
}

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  }
});

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

export async function getUserId(
  request: Request
): Promise<User["id"] | undefined> {
  const session = await getSession(request);
  const userId = session.get('userId');
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireAdminUser(request: Request) {
  const user = await requireUser(request);
  if (user.service === "Information Technology") {
    return user;
  }

  throw await logout(request);
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set('userId', userId);
  return redirect(redirectTo, {
    headers: { 'Set-Cookie': await sessionStorage.commitSession(session) }
  });
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session)
    }
  });
}

