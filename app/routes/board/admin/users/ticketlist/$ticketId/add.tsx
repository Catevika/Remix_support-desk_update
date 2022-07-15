import Dialog from "@reach/dialog";
import type { ActionFunction, LinksFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate, useParams } from "@remix-run/react";
import { prisma } from "~/utils/db.server";
import { validateText } from '~/utils/functions';
import { getUser } from "~/utils/session.server";

import styles from "@reach/dialog/styles.css";
import stylesUrl from "~/styles/dialog.css";

export let links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: styles,
    },
    {
      rel: "stylesheet",
      href: stylesUrl,
    },
  ];
};

type LoaderData = {
	user: Awaited<ReturnType<typeof getUser>>;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  const data: LoaderData = {
		user
}
  return data;
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    text: string | undefined;
  };
  fields?: {
    text: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request, params }) => {
  const user = await getUser(request);
  if(!user) {
    throw new Response('User Not Found.', {
      status: 404
    })
  }

  const userId = user.id;

  if(!params.ticketId) {
    throw new Response('Ticket Not Found.', {
			status: 404
		});
  }
  const ticketId = params.ticketId;

  const form = await request.formData();
  const text = form.get("text");

  if (
    typeof text !== "string" ||
    typeof ticketId !== "string" ||
    typeof userId !== "string" ||
    !ticketId || !text || !userId
  ) {
    return badRequest({
      formError: "Invalid form data",
    });
  }

  const fields = {  text };
  const fieldErrors = {
    text: validateText(text)
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors, fields };
  }

  const ticket = await prisma.ticket.findUnique({ where: { ticketId } });

  if(!ticket) {
    throw new Response('Ticket Not Found.', {
			status: 404
		});
  }

  const authorId = userId;

  if(!authorId) {
    throw new Response('Author Not Found.', {
			status: 404
		});
  }

  await prisma.note.create({
    data: {
      noteUserId: userId,
      noteTicketId: ticketId,
      text
    }
  });

  return redirect(`/board/admin/users/ticketlist/${ticketId}`);
};

export default function userAddTicketRoute() {
  const navigate = useNavigate();
  const actionData = useActionData() as ActionData;

  const ticketId = useParams().ticketId;

  function onDismiss() {
    navigate(`/board/admin/users/ticketlist/${ticketId}`);
  }
  return (
    <Dialog
      className="dialog"
      isOpen={true}
      aria-label="Add note"
      onDismiss={onDismiss}
    >
      <p>New Note:</p>
      <Form className="form" method="post" replace>
        <div className="form-group">
          <label className="label" htmlFor="text">
            Text:
            <textarea
              id="text"
              name="text"
              defaultValue={actionData?.fields?.text}
              aria-invalid={Boolean(actionData?.fieldErrors?.text)}
								aria-errormessage={
									actionData?.fieldErrors?.text
										? 'text-error' : undefined
								}
              className='form-textarea'
            />
          </label>
          {actionData?.fieldErrors?.text ? (
            <p className="error-danger"
              role="alert"
              id="name-error">
              {actionData.fieldErrors.text}
            </p>
          ) : null}
        </div>
        <div className="inline actions">
          <button type="submit" className="btn form-btn">Add</button>
          <button type="button" className="btn form-btn" onClick={onDismiss}>
            Cancel
          </button>
        </div>
      </Form>
    </Dialog>
  );
}
