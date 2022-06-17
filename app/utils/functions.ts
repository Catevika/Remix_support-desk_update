import { useMatches } from "@remix-run/react";
import { useMemo } from "react";

const DEFAULT_REDIRECT = "/";

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect;
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect;
  }

  return to;
}

export function validateUsername(username: unknown) {
  if (!username || typeof username !== 'string' || username.length < 3) {
    return 'Username must be at least 3 characters long';
  }
}

export function validateEmail(email: unknown) {
  if (!email || typeof email !== 'string' || email.length < 3 || email.indexOf("@") === -1) {
    return 'Email address is not valid';
  }
}

export function validatePassword(password: unknown) {
  if (!password || typeof password !== 'string' || password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
}

export function validateService(service: unknown) {
  if (service === '-- Please select your service --') {
    return 'A service must be selected';
  }
}

export function validateServiceName(name: unknown) {
  if (typeof name !== 'string' || name.length < 2) {
    return 'Service name must be at least 2 characters long';
  }
}

export function validateProduct(device: string) {
  if (!device || typeof device !== 'string' || device.length < 3) {
    return 'Product must be at least 3 characters long';
  }
}

export function validateStatus(type: string) {
  if (!type || typeof type !== 'string' || type.length < 3) {
    return 'Status must be at least 3 characters long';
  }
}

export function validateRole(roleType: string) {
  if (!roleType || typeof roleType !== 'string' || roleType.length < 2) {
    return 'Role must be at least 2 characters long';
  }
}

export function validateTitle(title: unknown) {
  if (!title || typeof title !== 'string' || title.length < 3) {
    return 'Title must be at least 3 characters long.';
  }
}

export function validateSelectedStatus(status: unknown) {
  if (!status || typeof status !== 'string') {
    return 'A status must be selected';
  }
}

export function validateSelectedProduct(product: unknown) {
  if (!product || typeof product !== 'string') {
    return 'A product must be selected';
  }
}

export function validateDescription(description: unknown) {
  if (!description || typeof description !== 'string' || description.length < 5) {
    return 'Description must be at least 5 characters long';
  }
}

// TODO: See if useMatchesData is usefull

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches();
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  );
  return route?.data;
}