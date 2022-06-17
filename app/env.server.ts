import invariant from "tiny-invariant";

export function getEnv() {
  invariant(process.env.ADMIN_ROLE, "ADMIN_ROLE should be set");
  return {
    ADMIN_ROLE: process.env.ADMIN_ROLE
  };
}

type ENV = ReturnType<typeof getEnv>;

declare global {
  var ENV: ENV;
  interface Window {
    ENV: ENV;
  }
}