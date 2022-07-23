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
        <p>Welcome to the Support-Desk!</p>
      </header>
      <main className='flex-container-column'>
        <img src={url} alt='' className='background-image' />
        <Form action='/register' method='post' className='form'>
            <button type='submit' className='btn'>
              Register
            </button>
          <p>
            to get your access for free!
          </p>
        </Form>
        <div className='icon-large-container'>
          <FaTools className='icon-large' />
        </div>
        <Form action='/login' method='post' className='form'>
            <button type='submit' className='btn'>
              Login
            </button>
          <p>
            with email and password
          </p>
        </Form>
      </main>
    </>
  );
}
