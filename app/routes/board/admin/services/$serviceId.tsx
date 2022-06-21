import type { LoaderFunction, ActionFunction, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  Link,
  useLoaderData,
  useCatch,
  useParams
} from '@remix-run/react';
import { prisma } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';
import ServiceDisplay from '~/components/ServiceDisplay';

export const meta: MetaFunction = ({
  data
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: 'No service',
      description: 'No service found'
    };
  }
  return {
    title: `Support-Desk | Service | ${data.name}`,
    description: `Here ist the  service created by ${data.name}`
  };
};

type LoaderData = {
  id: string;
  username: string;
  name: string;
  isOwner: boolean;
  canDelete: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await getUserId(request);
  const service = await prisma.service.findUnique({
    where: { serviceId: params.serviceId }
  });

  const users = await prisma.user.findMany({
    select: { id: true, username: true }
  });

  const user = users.filter((user) => user.id === service?.authorId)[0];

  const { id, username } = user;

  if (!username || !id) {
    throw new Response('User Not Found.', {
      status: 404
    });
  }

  if (!service) {
    throw new Response('Service Not Found.', {
      status: 404
    });
  }

  if (!user) {
    throw new Response('User Not Found.', {
      status: 404
    });
  }

  const data: LoaderData = {
    id,
    username,
    name: service.name,
    isOwner: userId === service.authorId,
    canDelete: true
  };
  return json(data);
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  if (form.get('_method') !== 'delete') {
    throw new Response(`The _method ${form.get('_method')} is not supported`, {
      status: 400
    });
  }
  const userId = await requireUserId(request);
  const service = await prisma.service.findUnique({
    where: { serviceId: params.serviceId }
  });
  if (!service) {
    throw new Response("Can't delete what does not exist", {
      status: 404
    });
  }
  if (service.authorId !== userId) {
    throw new Response("Can't delete a service that is not yours", {
      status: 401
    });
  }
  await prisma.service.delete({ where: { serviceId: params.serviceId } });
  return redirect('/board/admin/services/new-service');
};

export default function ServiceRoute() {
  const data = useLoaderData() as LoaderData;

  return (
    <>
      <main className='form-container form-container-admin'>
        {data.username && (
          <p>
            Service created by{' '}
            <span className='capitalize'>{data.username}</span>
          </p>
        )}
        <div className='form-content'>
          <ServiceDisplay
            name={data.name}
            isOwner={data.isOwner}
            canDelete={data.isOwner ? data.canDelete : false}
          />
        </div>
        <Link to='/board/admin/services/new-service'>
          <button className='btn form-btn'>Back to Create Service</button>
        </Link>
      </main>
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  switch (caught.status) {
    case 400: {
      return (
        <div className='error-container'>
          <div className='form-container form-content'>
            What you're trying to do is not allowed.
          </div>
        </div>
      );
    }
    case 404: {
      return (
        <div className='error-container'>
          <div className='form-container form-content'>
            {params.serviceId} does not exist.
          </div>
        </div>
      );
    }
    case 401: {
      return (
        <div className='error-container'>
          <div className='form-container form-content'>
            Sorry, but {params.serviceId} is not your service.
          </div>
        </div>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}

export function ErrorBoundary({ error }: { error: Error; }) {
  console.error(error);
  const { serviceId } = useParams();
  return (
    <div className='error-container'>
      <div className='form-container form-content'>
        There was an error loading the service by the id:{' '}
        <p>
          {' '}
          <span>{`${serviceId}.`}</span>
        </p>
        <p>Sorry.</p>
      </div>
    </div>
  );
}
