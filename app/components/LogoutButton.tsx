import { Form } from "@remix-run/react";

function LogoutButton() {
  return (
    <Form action='/logout' method='post' className='form-logout'>
      <button type='submit' className='btn'>
        Logout
      </button>
		</Form>
  )
}

export default LogoutButton