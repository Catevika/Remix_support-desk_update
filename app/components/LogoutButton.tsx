import { Form } from "@remix-run/react";

function LogoutButton() {
  return (
    <Form action='/logout' method='post'>
      <button type='submit' className='btn'>
        Logout
      </button>
		</Form>
  )
}

export default LogoutButton