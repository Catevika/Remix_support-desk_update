import { ActionFunction, LinksFunction, redirect } from "@remix-run/node";
import { Form, useNavigate, useParams, useTransition } from "@remix-run/react";
import { useRef } from "react";
import { AlertDialog, AlertDialogDescription, AlertDialogLabel } from "@reach/alert-dialog";
import { deleteAllNotes } from "~/models/notes.server";

import styles from "@reach/dialog/styles.css";
import stylesUrl from "~/styles/dialog.css";

export let links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: styles
    },
    {
      rel: "stylesheet",
      href: stylesUrl
    }
  ];
};

export const action: ActionFunction = async ({ request, params }) => {
	const form = await request.formData();
	const intent = form.get('intent');

	if(intent === 'delete') {
		await deleteAllNotes(params.ticketId)
    return redirect(`/board/employee/tickets/${params.ticketId}`);
	}
}

export default function deleteNoteConfirmRoute() {
  const navigate = useNavigate();
  const ticketId = useParams().ticketId;
  const cancelRef = useRef(null);
  const transition = useTransition();

  function onDismiss() {
    navigate(`/board/employee/tickets/${ticketId}`);
  }

	const isDeleting = Boolean(transition.submission?.formData.get('intent') === 'delete');

  return (
    <AlertDialog
      className="dialog"
      isOpen={true}
      aria-label="Delete all notes"
      onDismiss={onDismiss}
      leastDestructiveRef={cancelRef}
    >
      <AlertDialogLabel><p>Are you sure? Please confirm!</p></AlertDialogLabel>
      <AlertDialogDescription>
        <p><span className='error-danger error-danger-big'>This action is permanent.</span></p>
        <p>All notes for this ticket will be deleted from the database.</p>
        <p>To delete only one note, click on its 'view' button, then on the respective 'delete' button </p>
      </AlertDialogDescription>
      <div className="inline actions">
        <Form method='post' reloadDocument>
          <button type="submit" name='intent' value='delete' className="btn form-btn btn-danger" disabled={isDeleting}>{isDeleting ? 'isDeleting...' : 'Yes, delete'}</button>
        </Form>
        <button type="button" className="btn form-btn" ref={cancelRef} onClick={onDismiss}>
          No, cancel
        </button>
      </div>
    </AlertDialog>
  );
}
