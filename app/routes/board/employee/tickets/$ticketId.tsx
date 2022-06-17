import type { LoaderFunction, ActionFunction, MetaFunction } from '@remix-run/node';
import type { Ticket, User } from '@prisma/client';
import { json, redirect } from '@remix-run/node';
import {
  Link,
  useLoaderData,
  useCatch,
  useParams
} from '@remix-run/react';
import { prisma } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';
import { getTicketProductDevice, getTicketStatusType } from '~/models/tickets.server';
import { TicketDisplay } from '~/components/TicketDisplay';

export const meta: MetaFunction = ({
  data
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: 'No ticket',
      description: 'No ticket found'
    };
  }
  return {
    title: 'Support-Desk | tickets | Ticket'
  };
};

type LoaderData = {
  id: string;
  username: string;
  ticket: Ticket;
  device: string;
  type: string;
  isOwner: boolean;
  canDelete: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await getUserId(request);

  const ticket = await prisma.ticket.findUnique({
    where: { ticketId: params.ticketId }
  });

  if (!ticket) {
    throw new Response('Ticket Not Found.', {
      status: 404
    });
  }

  const product = await getTicketProductDevice(ticket.ticketProductId);

  if (!product) {
    throw new Response('Product Not Found.', {
      status: 404
    });
  }

  const status = await getTicketStatusType(ticket.ticketStatusId);

  if (!status) {
    throw new Response('Status Not Found.', {
      status: 404
    });
  }

  const users = await prisma.user.findMany({
    select: { id: true, username: true }
  });

  const user = users.filter((user) => user.id === ticket.authorId)[0];

  const { id, username } = user;

  if (!user) {
    throw new Response('User Not Found.', {
      status: 404
    });
  }

  const data: LoaderData = {
    id,
    username,
    ticket,
    device: product.device,
    type: status.type,
    isOwner: userId === ticket.authorId,
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
  const ticket = await prisma.ticket.findUnique({
    where: { ticketId: params.ticketId }
  });

  if (!ticket) {
    throw new Response("Can't delete what does not exist", {
      status: 404
    });
  }
  if (ticket.authorId !== userId) {
    throw new Response("Can't delete a ticket that is not yours", {
      status: 401
    });
  }
  await prisma.ticket.delete({ where: { ticketId: params.ticketId } });
  return redirect('/board/employee/tickets/new-ticket');
};

export default function TicketRoute() {
  const data = useLoaderData() as LoaderData;

  return (
    <>
      <main className='form-container'>
        {data.username && (
          <p>
            Ticket created by{' '}
            <span className='capitalize'>{data.username}</span>
          </p>
        )}
        <div className='form-content'>
          <TicketDisplay
            ticket={data.ticket}
            device={data.device}
            type={data.type}
            isOwner={data.isOwner}
            canDelete={data.isOwner ? data.canDelete : false}
          />
        </div>
        <div className='inline'>
          <Link to='/board/employee/tickets'>
            <button className='btn form-btn'>Back to Tickets</button>
          </Link>
          <Link to='/board/employee/tickets/new-ticket'>
            <button className='btn form-btn'>Back to Create Ticket</button>
          </Link>
        </div>
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
            {params.productId} does not exist.
          </div>
        </div>
      );
    }
    case 401: {
      return (
        <div className='error-container'>
          <div className='form-container form-content'>
            Sorry, but {params.productId} is not your product.
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
  const { productId } = useParams();
  return (
    <div className='error-container'>
      <div className='form-container form-content'>
        There was an error loading the product by the id:{' '}
        <p>
          {' '}
          <span>{`${productId}.`}</span>
        </p>
        <p>Sorry.</p>
      </div>
    </div>
  );
}
