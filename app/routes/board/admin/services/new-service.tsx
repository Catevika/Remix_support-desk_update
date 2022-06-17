import type { MetaFunction, LoaderFunction, ActionFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  Form,
  Link,
  useLoaderData,
  useActionData,
  useCatch
} from '@remix-run/react';

import { requireUserId, getUser } from '~/utils/session.server';
import { validateServiceName } from '~/utils/functions';
import { prisma } from '~/utils/db.server';

export const meta: MetaFunction = () => {
  return {
    title: 'Support-Desk | Services'
  };
};

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (!user || user.service !== 'Information Technology') {
    throw new Response('Unauthorized', { status: 401 });
  }
  return json<LoaderData>({ user });
};

type ActionData = {
  formError?: string;
  fieldErrors?: {
    name: string | undefined;
  };
  fields?: {
    name: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const form = await request.formData();
  const name = form.get('name');
  if (typeof name !== 'string') {
    return badRequest({
      formError: `Service must be an at least 2 characters long string`
    });
  }

  const fieldErrors = {
    name: validateServiceName(name)
  };

  const fields = { name };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const serviceExists = await prisma.service.findUnique({
    where: { name }
  });

  if (serviceExists) {
    return badRequest({
      fields,
      formError: `Service '${name}' already exists`
    });
  }

  await prisma.service.create({
    data: { name, authorId: userId }
  });
  return redirect(`/board/admin/services/new-service`);
};

export default function NewServiceRoute() {
  const { user } = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData;

  return (
    <>
      <main className='form-container'>
        <div className='form-content'>
          <Form reloadDocument method='post' className='form'>
            <p className='list'>
              New Service from&nbsp;
              <span className='capitalize'>{user?.username}</span>
            </p>
            <div className='form-group'>
              <label htmlFor='name'>
                New Service:{' '}
                <input
                  type='text'
                  defaultValue={actionData?.fields?.name}
                  name='name'
                  aria-invalid={Boolean(actionData?.fieldErrors?.name)}
                  aria-errormessage={
                    actionData?.fieldErrors?.name
                      ? 'service-error'
                      : undefined
                  }
                />
              </label>
              {actionData?.fieldErrors?.name ? (
                <p
                  className='error-danger'
                  role='alert'
                  id='name-error'
                >
                  {actionData.fieldErrors.name}
                </p>
              ) : null}
            </div>
            <div id='form-error-message'>
              {actionData?.formError ? (
                <p className='error-danger' role='alert'>
                  {actionData.formError}
                </p>
              ) : null}
              <button
                type='submit'
                name='_action'
                value='create'
                className='btn form-btn'
              >
                Add
              </button>
            </div>
          </Form>
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
          <p>You must be logged in with administrator rights to add a new service.</p>
          <Link to='/login?redirectTo=/services/new-service'>
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
