import type { MetaFunction } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { FaTools } from 'react-icons/fa';
import url from '~/assets/wave.svg';

export const meta: MetaFunction = () => {
  return {
    title: 'Support-Desk | Welcome'
  };
};

export default function WelcomeRoute() {
  return (
    <>
      <header className='container header header-left'>
        <h1>Welcome to the Support-Desk!</h1>
      </header>
      <main className='main'>
        <img src={url} alt='' className='background-image' />
        <Form action='/register' method='post' className='form container'>
          <p>
            <button type='submit' className='btn'>
              Register
            </button>
            &nbsp; to get an access for free!
          </p>
        </Form>
        <div className='icon-large-container'>
          <FaTools className='icon-large' />
        </div>
        <Form action='/login' method='post' className='form container'>
          <p>
            <button type='submit' className='btn'>
              Login
            </button>
            &nbsp; with email and password
          </p>
        </Form>
      </main>
    </>
  );
}
